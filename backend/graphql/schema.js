const { buildSchema } = require('graphql');

module.exports = buildSchema(`
type User {
  email: String!
}
type AuthData {
  jwt: String!
}
type Profile{
    _id: String
    Name: String
    Email: String
    Phone: String
    Currency: Int
    Language: Int
    Timezone: String
    Picture: String
}
type Person{
    users: [Profile!]
}
input ProfileInput{
    id: String!
    name: String!
    email: String!
    picture: String
    phone: String
    currency: Int
    timezone: String
    language: Int
}
input UserInput {
  name: String!
  email: String!
  password: String!
}
type Message{
    message: String
}
input IdInput{
    id: String
}
input GroupInput{
    user_id: String!
    user_name: String!
    name: String!
    picture: String
    members: [String]
}

type RootQuery {
    getprofile(user_id: String!): Profile!
    searchPerson(email: String!): Person!
}
type RootMutation {
    login(email: String!, password: String!): AuthData!
    signup(userInput: UserInput): User
    postProfile(profileInput: ProfileInput): Profile!
    createGroup(groupInput: GroupInput): Message

}
schema {
    query: RootQuery
    mutation: RootMutation
}
`);