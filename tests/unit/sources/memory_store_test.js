import Orbit from 'orbit/core';
import MemoryStore from 'orbit/sources/memory_store';
import RSVP from 'rsvp';

var store;

///////////////////////////////////////////////////////////////////////////////

module("Unit - MemoryStore", {
  setup: function() {
    Orbit.Promise = RSVP.Promise;

    var schema = {
      idField: '__id',
      models: {
        planet: {
          attributes: {
            name: {type: 'string'},
            classification: {type: 'string'}
          },
          links: {
            moons: {type: 'hasMany', model: 'moon', inverse: 'planet'}
          }
        },
        moon: {
          attributes: {
            name: {type: 'string'}
          },
          links: {
            planet: {type: 'hasOne', model: 'planet', inverse: 'moons'}
          }
        }
      }
    };

    store = new MemoryStore(schema);
  },

  teardown: function() {
    store = null;
    Orbit.Promise = null;
  }
});

test("it exists", function() {
  ok(store);
});

//test("#transform - can insert records and assign ids", function() {
//  expect(6);
//
//  equal(store.length('planet'), 0, 'store should be empty');
//
//  stop();
//  store.transform('add', 'planet', {name: 'Jupiter', classification: 'gas giant'}).then(function(planet) {
//    equal(store.length('planet'), 1, 'store should contain one record');
//    ok(planet.__id, '__id should be defined');
//    equal(planet.name, 'Jupiter', 'name should match');
//    equal(planet.classification, 'gas giant', 'classification should match');
//    return planet;
//
//  }).then(function(planet) {
//    store.findRecord('planet', planet.__id).then(function(foundPlanet) {
//      start();
//      equal(foundPlanet.__id, planet.__id, 'record can be looked up by __id');
//      return planet;
//    });
//  });
//});
//
//test("#transform - throws an error when a record with a duplicate id is inserted", function() {
//  expect(4);
//
//  equal(store.length('planet'), 0, 'store should be empty');
//
//  stop();
//  store.transform('add', 'planet', {name: 'Jupiter', classification: 'gas giant'}).then(function(planet) {
//    equal(store.length('planet'), 1, 'store should contain one record');
//    ok(planet.__id, '__id should be defined');
//    return planet;
//
//  }).then(function(planet) {
//    store.transform('add', 'planet', {__id: planet.__id, name: 'Jupiter', classification: 'gas giant'}).then(null, function(e) {
//      start();
//      equal(e.constructor, 'AlreadyExistsException', 'duplicate error');
//    });
//  });
//});
//
//test("#transform - can update records", function() {
//  expect(8);
//
//  equal(store.length('planet'), 0, 'store should be empty');
//
//  var original;
//
//  stop();
//  store.transform('add', 'planet', {name: 'Jupiter', classification: 'gas giant'}).then(function(planet) {
//    original = planet;
//    return store.transform('replace', 'planet', {__id: planet.__id, name: 'Earth', classification: 'terrestrial'}).then(function(updatedPlanet) {
//      equal(updatedPlanet.__id, planet.__id, '__id remains the same');
//      equal(updatedPlanet.name, 'Earth', 'name has been updated');
//      equal(updatedPlanet.classification, 'terrestrial', 'classification has been updated');
//      return planet;
//    });
//
//  }).then(function(planet) {
//    store.findRecord('planet', planet.__id).then(function(foundPlanet) {
//      start();
//      strictEqual(foundPlanet, original, 'still the same object as the one originally inserted');
//      equal(foundPlanet.__id, planet.__id, 'record can be looked up by __id');
//      equal(foundPlanet.name, 'Earth', 'name has been updated');
//      equal(foundPlanet.classification, 'terrestrial', 'classification has been updated');
//      return planet;
//    });
//  });
//});
//
//test("#transform - can patch records", function() {
//  expect(8);
//
//  equal(store.length('planet'), 0, 'store should be empty');
//
//  var original;
//
//  stop();
//  store.transform('add', 'planet', {name: 'Jupiter', classification: 'gas giant'}).then(function(planet) {
//    original = planet;
//    return planet;
//
//  }).then(function(planet) {
//    return store.transform('patch', 'planet', {__id: planet.__id, name: 'Earth'}).then(function(updatedPlanet) {
//      equal(updatedPlanet.__id, planet.__id, '__id remains the same');
//      equal(updatedPlanet.name, 'Earth', 'name has been updated');
//      equal(updatedPlanet.classification, 'gas giant', 'classification has not been updated');
//      return planet;
//    });
//
//  }).then(function(planet) {
//    store.findRecord('planet', planet.__id).then(function(foundPlanet) {
//      start();
//      strictEqual(foundPlanet, original, 'still the same object as the one originally inserted');
//      equal(foundPlanet.__id, planet.__id, 'record can be looked up by __id');
//      equal(foundPlanet.name, 'Earth', 'name has been updated');
//      equal(foundPlanet.classification, 'gas giant', 'classification has not been updated');
//      return planet;
//    });
//  });
//});
//
//test("#transform - can delete records", function() {
//  expect(3);
//
//  equal(store.length('planet'), 0, 'store should be empty');
//
//  stop();
//  store.transform('add', 'planet', {name: 'Jupiter', classification: 'gas giant'}).then(function(planet) {
//    equal(store.length('planet'), 1, 'store should contain one record');
//
//    store.transform('remove', 'planet', {__id: planet.__id}).then(function() {
//      start();
//      equal(store.length('planet'), 0, 'store should be empty');
//    });
//  });
//});

test("#find - can find all records", function() {
  expect(3);

  equal(store.length('planet'), 0, 'store should be empty');

  stop();
  RSVP.all([
    store.add('planet', {name: 'Jupiter', classification: 'gas giant', atmosphere: true}),
    store.add('planet', {name: 'Earth', classification: 'terrestrial', atmosphere: true}),
    store.add('planet', {name: 'Mercury', classification: 'terrestrial', atmosphere: false})
  ]).then(function() {
    equal(store.length('planet'), 3, 'store should contain 3 records');
    store.find('planet').then(function(allPlanets) {
      start();
      equal(allPlanets.length, 3, 'find() should return all records');
      return allPlanets;
    });
  });
});

test("#find - can find records by one or more filters", function() {
  expect(5);

  equal(store.length('planet'), 0, 'store should be empty');

  stop();
  RSVP.all([
    store.add('planet', {name: 'Jupiter', classification: 'gas giant', atmosphere: true}),
    store.add('planet', {name: 'Earth', classification: 'terrestrial', atmosphere: true}),
    store.add('planet', {name: 'Venus', classification: 'terrestrial', atmosphere: true}),
    store.add('planet', {name: 'Mercury', classification: 'terrestrial', atmosphere: false})
  ]).then(function() {
    equal(store.length('planet'), 4, 'store should contain 4 records');

    store.find('planet', {classification: 'terrestrial', atmosphere: true}).then(function(allPlanets) {
      start();
      equal(allPlanets.length, 2, 'findRecord() should return all records');
      equal(allPlanets[0].name, 'Earth', 'first matching planet');
      equal(allPlanets[1].name, 'Venus', 'second matching planet');
      return allPlanets;
    });
  });
});

test("#add - creates a record", function() {
  expect(6);

  equal(store.length('planet'), 0, 'store should be empty');

  var original;

  stop();
  store.add('planet', {name: 'Jupiter', classification: 'gas giant'}).then(function(planet) {
    original = planet;
    equal(store.length('planet'), 1, 'store should contain one record');
    ok(planet.__id, '__id should be defined');
    equal(planet.name, 'Jupiter', 'name should match');
    equal(planet.classification, 'gas giant', 'classification should match');
    return planet;

  }).then(function(planet) {
    store.find('planet', planet.__id).then(function(foundPlanet) {
      start();
      equal(foundPlanet.__id, original.__id, 'record can be looked up by __id');
      return planet;
    });
  });
});

test("#update - can update records", function() {
  expect(7);

  equal(store.length('planet'), 0, 'store should be empty');

  var original;

  stop();
  store.add('planet', {name: 'Jupiter', classification: 'gas giant'}).then(function(planet) {
    original = planet;
    return store.update('planet', {__id: planet.__id, name: 'Earth', classification: 'terrestrial'}).then(function(updatedPlanet) {
      equal(updatedPlanet.__id, planet.__id, '__id remains the same');
      equal(updatedPlanet.name, 'Earth', 'name has been updated');
      equal(updatedPlanet.classification, 'terrestrial', 'classification has been updated');
      return planet;
    });

  }).then(function(planet) {
    store.find('planet', planet.__id).then(function(foundPlanet) {
      start();
      equal(foundPlanet.__id, original.__id, 'record can be looked up by __id');
      equal(foundPlanet.name, 'Earth', 'name has been updated');
      equal(foundPlanet.classification, 'terrestrial', 'classification has been updated');
      return planet;
    });
  });
});

test("#patch - can patch records", function() {
  expect(5);

  equal(store.length('planet'), 0, 'store should be empty');

  var original;

  stop();
  store.add('planet', {name: 'Jupiter', classification: 'gas giant'}).then(function(planet) {
    original = planet;

    store.patch('planet', planet.__id, 'name', 'Earth').then(function() {
      store.find('planet', planet.__id).then(function(foundPlanet) {
        start();
        strictEqual(foundPlanet, original, 'still the same object as the one originally inserted');
        equal(foundPlanet.__id, planet.__id, 'record can be looked up by __id');
        equal(foundPlanet.name, 'Earth', 'name has been updated');
        equal(foundPlanet.classification, 'gas giant', 'classification has not been updated');
      });
    });
  });
});

test("#remove - can destroy records", function() {
  expect(3);

  equal(store.length('planet'), 0, 'store should be empty');

  stop();
  store.add('planet', {name: 'Jupiter', classification: 'gas giant'}).then(function(planet) {
    equal(store.length('planet'), 1, 'store should contain one record');
    store.remove('planet', {__id: planet.__id}).then(function() {
      start();
      equal(store.length('planet'), 0, 'store should be empty');
    });
  });
});

test("#link and #unlink- can link and unlink records in a many-to-one relationship via the 'many' side", function() {
  expect(6);

  equal(store.length('planet'), 0, 'store should be empty');

  var jupiter,
      io;

  stop();
  store.add('planet', {name: 'Jupiter', classification: 'gas giant', atmosphere: true}).then(function(planet) {
    jupiter = planet;
    return store.add('moon', {name: 'Io'});

  }).then(function(moon) {
    io = moon;

  }).then(function() {
    return store.link('planet', jupiter, 'moons', io);

  }).then(function() {
    equal(Object.keys(jupiter.links.moons).length, 1, 'Jupiter has one moon after linking');
    ok(jupiter.links.moons[io.__id], 'Jupiter\'s moon is Io');
    equal(io.links.planet, jupiter.__id, 'Io\'s planet is Jupiter');

    return store.unlink('planet', jupiter, 'moons', io);

  }).then(function() {
    start();
    equal(io.links.planet, undefined, 'Io is not associated with a planet after unlinking');
    equal(Object.keys(jupiter.links.moons).length, 0, 'Jupiter has no moons after unlinking');
  });
});

test("#link and #unlink- can link and unlink records in a many-to-one relationship via the 'one' side", function() {
  expect(6);

  equal(store.length('planet'), 0, 'store should be empty');

  var jupiter,
      io;

  stop();
  store.add('planet', {name: 'Jupiter', classification: 'gas giant', atmosphere: true}).then(function(planet) {
    jupiter = planet;
    return store.add('moon', {name: 'Io'});

  }).then(function(moon) {
    io = moon;

  }).then(function() {
    return store.link('planet', jupiter, 'moons', io);

  }).then(function() {
    equal(Object.keys(jupiter.links.moons).length, 1, 'Jupiter has one moon after linking');
    ok(jupiter.links.moons[io.__id], 'Jupiter\'s moon is Io');
    equal(io.links.planet, jupiter.__id, 'Io\'s planet is Jupiter');

    return store.unlink('moon', io, 'planet');

  }).then(function() {
    start();
    equal(io.links.planet, undefined, 'Io is not associated with a planet after unlinking');
    equal(Object.keys(jupiter.links.moons).length, 0, 'Jupiter has no moons after unlinking');
  });
});

