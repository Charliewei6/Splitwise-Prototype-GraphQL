var crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../Models/UserModel');
const {secret} = require('../config');
const CreateGroup = require('../Models/CreateGroupModel');
const GroupPerson = require('../Models/GroupPersonModel')
const Invite = require('../Models/InviteModel')

module.exports = {
  signup: async args => {
    console.log("insdie signup")
    try {
      const existingUser = await User.findOne({ Email: args.userInput.email });
      if (existingUser) {
        throw new Error('User exists already.');
      }
      const user = new User({
        Name: args.userInput.name,
        Email: args.userInput.email,
        Password: crypto.createHash('md5').update(args.userInput.password).digest("hex")
      });
      const result = await user.save();
      console.log(result)
      return { email: result.Email };
    } catch (err) {
      throw err;
    }
  },

  login: async ({ email, password }) => {
    console.log("insdie login")
    const user = await User.findOne({ Email: email, Password: crypto.createHash('md5').update(password).digest("hex") });
    if (user) {
        const payload = { _id: user._id,email: user.Email};
        const token = jwt.sign(payload, secret, {
            expiresIn: 1008000
        });
        return {jwt: "JWT " + token };
    }
    else{
        throw new Error('Username or Password does not correct!');
    }
   
  },
  
  getprofile: async ({user_id}) => {
    console.log("insdie get profile")
    const user = await User.findOne({ _id: user_id });
    return {
        _id: user._id,
        Name: user.Name, Email:user.Email,Phone:user.Phone,
        Currency: user.Currency, Language:user.Language,
        Timezone: user.Timezone, Picture:user.Picture
    }
  },
  postProfile: async args => {
    console.log("insdie post profile")
    id = args.profileInput.id
    var newvalues = {$set: {Name: args.profileInput.name,Email: args.profileInput.email,
        Picture:args.profileInput.picture, Phone:args.profileInput.phone, 
        Currency:args.profileInput.currency,Timezone:args.profileInput.timezone,
        Language:args.profileInput.language} };
    const user = await User.findByIdAndUpdate( id, newvalues);
    console.log(user)
    return{
        _id: user._id,
        Name: user.Name, Email:user.Email,Phone:user.Phone,
        Currency: user.Currency, Language:user.Language,
        Timezone: user.Timezone, Picture:user.Picture
    }
  },
  searchPerson: async ({email}) => {
    console.log("insdie search person")
    email = email.split(" ").map(n => new RegExp(n));
    result = await User.find({Email:{ $in: email }});
    return{users: result}
  },
  createGroup : async args => {
    console.log("insdie create group")
    var userName = args.groupInput.user_name;
    var name = args.groupInput.name;
    var members = args.groupInput.members;

    var newgroup = new CreateGroup({
        name : args.groupInput.name,
        picture :args.groupInput.picture,
        creator_id: args.groupInput.user_id
    });
    var result = await CreateGroup.findOne({ name: args.groupInput.name })
    if (result) {
        throw new Error('Group name already exists!');
    }
    else {
        data = await newgroup.save() 
        if (data) {
            var groupId = data._id;
            var myobj = { group_id: groupId, person_id: data.creator_id };
            var res = await GroupPerson.create(myobj)
            if (res) {
                var obj = [];
                for (var i=0; i<members.length; i++) {
                    obj.push({inviter_id:res.person_id,inviter_name:userName,group_id:groupId,group_name:name,invitee_id:members[i]})
                }       
                console.log(obj)
                await Invite.create(obj)
            } 
        }
    }
    return {message: "success"}

    
  }
};