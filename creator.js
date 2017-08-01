function createLevelDBJoiner (execlib, leveldblib) {
  'use strict';

  var lib = execlib.lib,
    q = lib.q,
    qlib = lib.qlib,
    JobBase = qlib.JobBase;

  function extenderRecFromVal (record, valtojoin) {
    return lib.extend({}, record, valtojoin);
  }

  function extenderSquared (valstojoin, result, record) {
    var imres = valstojoin.map(extenderRecFromVal.bind(null, record));
    Array.prototype.push.apply(result, imres);
    record = null;
    return result;
  }

  function extender (valtojoin, record) {
    var ret;
    if (lib.isArray(valtojoin)) {
      if (lib.isArray(record)) {
        ret = record.reduce(extenderSquared.bind(null, valtojoin), []);
        valtojoin = null;
        return ret;
      }
      ret = valtojoin.map(extenderRecFromVal.bind(null, record));
      record = null;
      return ret;
    }
    if (lib.isArray(record)) {
      ret = record.map(extender.bind(null, valtojoin));
      return ret;
    }
    record = lib.extend({}, record, valtojoin);
    valtojoin = null;
    return record;
  }

  function UpsertJob (ldb, key, value, defer) {
    JobBase.call(this, defer);
    this.ldb = ldb;
    this.key = key;
    this.value = value;
  }
  lib.inherit(UpsertJob, JobBase);
  UpsertJob.prototype.destroy = function () {
    this.value = null;
    this.key = null;
    this.ldb = null;
    JobBase.prototype.destroy.call(this);
  };
  UpsertJob.prototype.go = function () {
    qlib.promise2defer(this.ldb.upsert(this.key, extender.bind(null, this.value), {}), this);
    return this.defer;
  };

  function LevelDBJoiner (outerkey2innerkeyfunc, starteddefer) {
    this.outerkey2innerkeyFunc = outerkey2innerkeyfunc;
    this.ldb = null;
    this.q = new qlib.JobCollection();
    var mystarteddefer = q.defer();
    if (starteddefer) {
      mystarteddefer.promise.then(
        starteddefer.resolve.bind(starteddefer, this),
        starteddefer.reject.bind(starteddefer)
      );
    }
    this.ldb = new leveldblib.LevelDBHandler({
      dbname: lib.uid()+'joiner.db',
      dbcreationoptions: {
        valueEncoding: 'json'
      },
      starteddefer: mystarteddefer
    })
  }
  LevelDBJoiner.prototype.destroy = function () {
    if (this.q) {
      this.q.destroy();
    }
    this.q = null;
    if (this.ldb) {
      this.ldb.drop();
    }
    this.ldb = null;
    this.outerkey2innerkeyFunc = null;
  };
  LevelDBJoiner.prototype.join = function (outerkey, value) {
    var innerkey = this.toInnerKey(outerkey);
    return this.q.run('update', new UpsertJob(this.ldb, innerkey, value));
  };
  LevelDBJoiner.prototype.joinKeyVal = function (keyval) {
    var testkey;
    if (!(lib.isArray(keyval) && keyval.length===2)) {
      return q.reject(new lib.Error('NOT_A_KEYVALUE_PAIR', 'KeyValue pair has to be an array of 2 elements'));
    }
    return this.join(keyval[0], keyval[1]);
  };
  LevelDBJoiner.prototype.joinMany = function (keyvals) {
    return (new qlib.PromiseChainerJob(keyvals.map(this.joinerFromMany.bind(this)))).go();
  };
  LevelDBJoiner.prototype.joinerFromMany = function (keyval) {
    return this.joinKeyVal.bind(this, keyval);
  };
  LevelDBJoiner.prototype.traverse = function (cb) {
    if (!this.ldb) {
      return q.reject(new lib.Error('ALREADY_DESTROYED', 'This instance of LevelDBJoiner is already destroyed'));
    }
    return this.ldb.traverse(cb);
  };
  LevelDBJoiner.prototype.drop = function () {
    if (!this.ldb) {
      return q(true);
    }
    var ret = this.ldb.drop();
    ret.then(this.destroy.bind(this));
    return ret;
  };
  LevelDBJoiner.prototype.toInnerKey = function (outerkey) {
    return lib.isFunction(this.outerkey2innerkeyFunc) ?
      this.outerkey2innerkeyFunc(outerkey) :
      outerkey;
  };



  return LevelDBJoiner;
}

module.exports = createLevelDBJoiner;
