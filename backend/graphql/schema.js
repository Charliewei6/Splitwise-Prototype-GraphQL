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
type Invite{
    _id: String
    inviter_id: String
    inviter_name: String
    group_id: String
    group_name: String
    invitee_id: String
}
type InviteList{
    inviteList: [Invite]
}
type Group{
    _id:String
    name: String
    picture:String
    creator_id:String
}
type Groups{
    _id:String
    group_id: Group
    person_id: String
    balance: Float
}
type GroupList{
    groupList: [Groups]
}
type Code{
    code: Int
}

input ExpenseInput{
    user_id: String
    user_name: String
    group_id: String
    group_name: String
    name: String
    money: Float
}
type Page{
    expense: [Expense]
    member: [Member]
}
type Expense{
    _id: String
    creator_id: String
    creator_name: String
    group_id: String
    group_name: String
    money: Float
    name: String
    create_at: String
    comment_list: [Comment]
}
type Comment{
    notes: String
    creator_id: Profile
}
type Member{
    balance: Float
    _id: String
    group_id: String
    person_id: Profile
}
input CommentInput{
    expense_id: String
    user_id: String
    note: String
}
type Dashboard{
    owe: [Owe]
    owed: [Owed]
    total_owe: Float,
    total_owed: Float,
    total_balance: Float
}
type Owe{
    status: Int
    _id: String
    expense_id: Expense
    group_id: String
    owe_id: String
    owed_id: Profile
    money: Float
}
type Owed{
    status: Int
    _id: String
    expense_id: Expense
    group_id: String
    owe_id: Profile
    owed_id: String
    money: Float
}
type Activity{
    activity: [Owed]
}

type RootQuery {
    getprofile(user_id: String!): Profile!
    searchPerson(email: String!): Person
    getInvite(user_id: String!): InviteList
    getGroups(user_id: String!,group_name:String!): GroupList
    groupPage(group_id: String!): Page!
    getDashboard(user_id: String): Dashboard
    getActivity(user_id: String, group_id: String, order:Int): Activity
}
type RootMutation {
    login(email: String!, password: String!): AuthData!
    signup(userInput: UserInput): User
    postProfile(profileInput: ProfileInput): Profile
    createGroup(groupInput: GroupInput): Message
    postInvite(invite_id: String!): Message
    quitGroup(user_id:String!,group_id:String!): Code
    addExpense(expenseInput:ExpenseInput):Code
    addComment(commentInput:CommentInput):Message
    delComment(noteId: String):Message
    settleUp(user_id:String):Message
}
schema {
    query: RootQuery
    mutation: RootMutation
}
`);