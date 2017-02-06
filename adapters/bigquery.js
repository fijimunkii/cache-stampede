module.exports = function(client,prefix) {
  return {

    get : function(key,options) {
      var sqlQuery = `SELECT * FROM ${prefix} WHERE id = ${key}`;
      if (options && options.find)
        sqlQuery += ` AND ${options.find}`;
      sqlQuery += ' LIMIT 1';
      const query = { query: sqlQuery, timeoutMs: 10000, useLegacySql: false };
      let job;
      return client.startQuery(query)
        .then(res => {
          job = res[0];
          return job.promise();
        })
        .then(() => job.getQueryResults())
        .then(res => res && res[0] && res[0][0] || undefined);
    },

    insert : function(key,d,expiry) {
      // TBD datasetId
      const dataset = client.dataset(datasetId);
      const table = dataset.table(prefix);
      return table.insert(d)
        .then(insertErrors => {
          if (insertErrors)
            throw insertErrors;
        });
    },

    update : function(key,d,expiry) {
      // TBD if a row can be deleted or updated
    },

    remove : function(key) {
      // TBD if a row can be deleted or updated
    }

  };
};
