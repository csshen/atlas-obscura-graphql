const { ApolloServer, gql } = require('apollo-server-lambda');
const axios = require('axios');
const cheerio = require('cheerio');

const places_url = 'https://www.atlasobscura.com/places/';

const typeDefs = gql`
    type Query {
        hello: String
        place(id: String!): Place
    }

    type Place {
        name: String
        description: String
        city: String
        state: String
    }
`;

const resolvers = {
    Query: {
        hello: hello,
        place: getPlace
    }
};

function hello(root, args, context) {
    return `Hello World! This is a test resolver to make sure everything is working properly.`;
}

async function getPlace(root, args, context) {
    const response = await axios.get(places_url + args.id);
    const $ = cheerio.load(response.data);

    let location = $('.DDPage__header-place-location').text().split(',');
    if (location.length === 1) location.unshift(null);
    let [city, state] = location;
    
    return {
        name: $('h1.DDPage__header-title').text(),
        description: $('h3.DDPage__header-dek').text().trim(),
        city,
        state
    };
}


const server = new ApolloServer({
    typeDefs,
    resolvers
});

exports.handler = server.createHandler();
