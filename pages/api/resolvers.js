const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {ObjectID} = require('mongodb');
const {JWT_SECRET}= process.env;

const getToken = (user) => jwt.sign({id:user._id},JWT_SECRET,{expiresIn:'7days'})
const getUserFromToken = async(token,db) => {
	if (!token) {
		return null;
	}

	// Actual decode/verifying strts here
	const tokenData = jwt.verify(token,JWT_SECRET);
	if (!tokenData?.id) {
		return null;
	}

	const user = await db.collection('Users').findOne({_id:  ObjectID(tokenData.id)})
	return user;
}

const resolvers = {
	Query: {
		getTaskLists: () => []
	},

	Mutation: {
		signUp: async(_,{input},context) => {
			console.log(input);
			const hashedPassword = user && bcrypt.hashSync(input.password);
			const newUser = {
				...input,
				password: hashedPassword
			}

			// Save the user to database
			const result = await context.db.collection('Users').insert(newUser);
			console.log(result);
			user = result.ops[0]
			return{
				user,
				token:getToken(user)
			}
		},

		signIn: async(_,{input},context) => {
			const user = await context.db.collection('User').findOne({email:input.email})
			if(!user){
				throw new Error('Invalid Credentials');
			}

			const isPasswordCorrect = bcrypt.compareSync(input.password,user.password)
			if(!isPasswordCorrect){
				throw new Error('Invalid Credentials');
			}

			return{
				user,
				token:getToken(user)
			}
		},

		createTaskList: (_,{title},context) => {
			if (!context.user) {
				throw new Error('Please SignIn')
			}

			const newTaskList = {
				title,
				createdAt: new Date().toISOString(),

			}

			const result = db.collection('TaskLists').insert(newTaskList);
			return result.ops[0];
		}

		
	},

	User:{
		id: (parent) => parent._id || parent.id,
	},

	TaskList:{
		id: (parent) => parent._id || parent.id,
		progress: () => 0,
		
	}
}

module.exports = {
	resolvers,
	getUserFromToken
}