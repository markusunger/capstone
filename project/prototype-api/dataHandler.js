/*
  A simple in-memory object for storing and retrieving data
  to test out the API

  methods needed to simulate data retrieval from external store:
  - getResources -> list of all resource items of a specified name
  - getResource -> one specific resource item of a specified name and a specified id
*/

const sampleData = {
  users: [
    {
      id: 1,
      name: 'Markus',
      comments: [
        {
          id: 1,
          text: 'The best JS programmer I know.',
        },
        {
          id: 2,
          text: 'Such a great guy.',
        },
      ],
    },
    {
      id: 2,
      name: 'Bharat',
      comments: [
        {
          id: 1,
          text: 'Made an amazing Capstone project.',
        },
        {
          id: 2,
          text: 'Such a joy to work with.',
        },
      ],
    },
    {
      id: 3,
      name: 'Catherine',
      comments: [
        {
          id: 1,
          text: 'Always looking for a deeper understanding, very impressive.',
        },
        {
          id: 2,
          text: 'Always a joy to meet her.',
        },
      ],
    },
  ],
};

module.exports = (function dataHandler() {
  const data = sampleData;

  return {
    getResources: function getResources(name) {
      if (data[name]) return data[name];
      return undefined;
    },

    getResource: function getResource(name, id) {
      if (!data[name]) return undefined;
      const match = data[name].find(item => item.id === id);
      if (!match) return undefined;
      return match;
    },
  };
}());
