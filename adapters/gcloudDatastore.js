const serialize = d => {
  let data = {
    id: d.key,
    cs_data: d.data,
    cs_info: d.info,
    cs_caching: d.__caching__,
    cs_updated: d.updated,
    cs_encrypted: d.encrypted || false,
    cs_compressed: d.compressed || false,
    cs_error: d.error || false,
    cs_expiryTime: d.expiryTime
  };
  return data;
};

const deSerialize = d => {
  if (!d) return;
  let data = {
    key: d.id,
    data: d.cs_data,
    info: d.cs_info,
    __caching__: d.cs_caching,
    updated: d.cs_updated,
    encrypted: d.cs_encrypted,
    compressed: d.cs_compressed,
    error: d.cs_error,
    expiryTime: d.cs_expiryTime
  };
  return data;
};

const Promise = require('bluebird');

module.exports = function(client,prefix) {  
  prefix = prefix || 'cache';
  return {

    get : function(key,options) {
      var query = client.key([prefix,key]);
      return client.get(query)
        .then(d => deSerialize(d && d[0] && d[0].d));
    },

    insert : function(key,d) {
      d.key = key;
      d = serialize(d);
      var query = {
        key: client.key([prefix,key]),
        data: { d: d }
      };
      const transaction = client.transaction();
      return transaction.run()
        .then(() => transaction.get(query.key))
        .then(results => {
          if (results[0])
            throw new Error('KEY_EXISTS');
          transaction.save(query);
          return transaction.commit();
        })
        .catch(err => {
          return transaction.rollback()
            .then(() => { throw err });
        });
    },

    update : function(key,d) {
      d.key = key;
      d = serialize(d);
      var query = {
        key: client.key([prefix,key]),
        data: { d: d }
      };
      return client.update(query);
    },

    remove : function(key) {
      var query = client.key([prefix,key]);
      return client.delete(query);
    }

  };
};
