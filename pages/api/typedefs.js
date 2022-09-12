const {gql} = require('apollo-server-micro');

const typeDefs = gql`
	type User  {
		id: ID!
		name: String!
		email: String!
		avatar: String
	}

	type TaskList {
		id: ID!
		createdAt: String!
		title: String!
		progress: Float!
		users:[User!]!
		todos :[ToDo!]!
	}

	type ToDo {
		id: ID!
		content: String!
		isCompleted: Boolean!
		taskList: TaskList!
	}


	type AuthUser {
		user: User!
		token: String!
	}

	input SignUpInput {
		name: String!
		email: String!
		password: String!
		avatar: String
	}

	input SignInInput {
		email: String!
		password: String!
		
	}

	type Query {
		getTaskLists: [TaskList!]!
	}

	type Mutation {
		signUp(input:SignUpInput): AuthUser!
		signIn(input:SignInInput): AuthUser!

		createTaskList(title:String!): TaskList!
	}
`

module.exports = typeDefs