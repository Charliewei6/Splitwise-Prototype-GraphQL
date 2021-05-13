var crypto = require('crypto');
const jwt = require('jsonwebtoken');
const {secret} = require('../config');
var moment = require("moment");

const User = require('../Models/UserModel');
const CreateGroup = require('../Models/CreateGroupModel');
const GroupPerson = require('../Models/GroupPersonModel')
const Invite = require('../Models/InviteModel')
const Expense = require('../Models/ExpenseModel')
const ExpenseItem = require('../Models/ExpenseItemModel')
const Comment = require('../Models/CommentModel')

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
        throw 'Group name already exists!';
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
                    if(members[i]!='undefined'){
                        obj.push({inviter_id:res.person_id,inviter_name:userName,group_id:groupId,group_name:name,invitee_id:members[i]})
                    }
                }       
                console.log(obj)
                await Invite.create(obj)
            } 
        }
    }
    return {message: "create group success"}
  },
  getInvite : async ({user_id}) => {
    console.log("insdie get invite")
    const res = Invite.find({invitee_id:user_id});
    return{inviteList:res}
  },
  postInvite : async ({invite_id}) => {
    console.log("insdie post invite")
    var inviteId = invite_id;
    result = await Invite.find({_id:inviteId})
    var groupId = result[0].group_id;
    var personId = result[0].invitee_id;
    var myobj = { group_id: groupId, person_id: personId, balance:0 };
    await GroupPerson.create(myobj);
    await Invite.findByIdAndDelete({_id:inviteId});   
    return {message: "post invite success"}    
  },
  getGroups : async ({user_id,group_name}) => {
    console.log("insdie get groups")
    var userId = user_id;
    if (group_name) {
        var name = group_name.split(" ").map(n => new RegExp(n));
        var result = await GroupPerson.find({ person_id:userId}).
        populate({path: 'group_id',match:{name:{$in: name}} } )

        result= result.filter(element=>element.group_id !== null)
        return {groupList : result}
         
    } else {
        var result = await GroupPerson.find({ person_id:userId }).
        populate('group_id')
        return {groupList : result}
    }
  },
  quitGroup : async ({user_id,group_id}) => {
    console.log("insdie quit groups")
    var userId = user_id;
    var groupId = group_id;
    var result = await GroupPerson.find({group_id:groupId,person_id:userId})
    if (result[0].balance != 0) {
        return {code:0}
    } 
    else if (result[0].balance === 0) {
        await GroupPerson.findByIdAndDelete({_id:result[0]._id})
        return {code:1}
    } 
  },
  addExpense : async args => {
    console.log("insdie add expense")
    var userId = args.expenseInput.user_id;
    var userName = args.expenseInput.user_name;
    var groupId = args.expenseInput.group_id;
    var groupName = args.expenseInput.group_name;
    var name = args.expenseInput.name;
    var money = args.expenseInput.money;
    var create_at = moment().format('YYYY-MM-DD HH:mm:ss');

    var members = await GroupPerson.find({group_id:groupId})   
    var obj={creator_id:userId, creator_name:userName, group_id:groupId, group_name:groupName, money:money, name:name, create_at:create_at}
    var result = await Expense.create(obj)
    var expenseId = result._id;
    var addsql = []
    var num = members.length;
    var item_money = money / num;
    if (num <= 1) {
        return {code:0}
    } 
    else {
        for (var i=0; i<num; i++) {
            if (members[i].person_id != userId) {
                addsql.push({expense_id:expenseId, group_id:groupId, owe_id:members[i].person_id, owed_id:userId, money:item_money})
                var result1 = await GroupPerson.findOne({person_id: members[i].person_id,group_id:groupId}) 
                await GroupPerson.findOneAndUpdate({person_id: result1.person_id,group_id:result1.group_id},{$set: {balance:result1.balance-item_money}})
            }
        }
        await ExpenseItem.create(addsql)
        var ownMnoey = money - item_money;
        var result2 = await GroupPerson.findOne({person_id: userId,group_id:groupId})
        await GroupPerson.findOneAndUpdate({person_id: userId,group_id:groupId},{$set: {balance:result2.balance+ownMnoey}})
    }
    return {code:1}
  },
  groupPage: async ({group_id}) => {
    console.log("insdie get group page")
    var groupId = group_id;
    var res1 = await Expense.find({group_id:groupId}).sort({ create_at: 'desc' }).
    populate([ {path: 'comment_list'},{path: 'comment_list',populate: {path: 'creator_id'}} ])
    
    var res2 = await GroupPerson.find({ group_id:groupId }).
    populate({path: 'person_id'} )
    console.log("expense:",res1);
    console.log("member:",res2);
    return{
        expense:res1,
        member:res2
    }
  },
  addComment : async args => {
    console.log("insdie add comment")
    var expenseId = args.commentInput.expense_id
    var userId = args.commentInput.user_id
    var note = args.commentInput.note
    var obj={creator_id:userId,notes:note}

    var result = await Comment.create(obj)
    var info = await Expense.findOne({_id:expenseId})
    var commentList = info.comment_list
    commentList.push(result._id)
    var newvalues = {$set: {comment_list: commentList} };
    await Expense.findByIdAndUpdate( {_id:info._id}, newvalues)

    return{ message:"add comment success"}
  },
  delComment: async ({noteId}) => {
    console.log("insdie delete comment")
    await Comment.findByIdAndDelete({_id:noteId})
    return{ message:"delete comment success"}
  },
  getDashboard : async ({user_id}) => {
    console.log("insdie get dashboard")
    var userId = user_id;
    var res1 = await ExpenseItem.find({owe_id:userId,status:0}).sort({ _id: 'desc' }).
    populate('expense_id owed_id')
    var res2 = await ExpenseItem.find({owed_id:userId,status:0}).sort({ _id: 'desc' }).
    populate('expense_id owe_id')
   
    console.log("res1:",res1);
    console.log("res2:",res2);

    var owe_sum=0
    for(var i=0;i<res1.length;i++)
        owe_sum +=res1[i].money        

    var owed_sum=0
    for(var i=0;i<res2.length;i++)
        owed_sum +=res2[i].money
    
    var total = owed_sum - owe_sum
    return{
        owe: res1,
        owed: res2,
        total_owe: owe_sum,
        total_owed: owed_sum,
        total_balance: total
    }
  },
  getActivity:async ({user_id,group_id,order}) => {
    console.log("insdie get activity")
    var userId = user_id;
    var groupId = group_id;
    if (groupId) {
      var result = await ExpenseItem.find({ $or: [{ owe_id: userId }, { owed_id: userId }],group_id:groupId}).
      populate('expense_id owe_id')
      if(order==0)
          result = result.reverse()
          return{activity:result}
      }else{
          var result = await ExpenseItem.find({ $or: [{ owe_id: userId }, { owed_id: userId }]}).
          populate('expense_id owe_id')
          if(order==0)
              result = result.reverse()
          return{activity:result}
      }
  },
  settleUp :async ({user_id}) => {
    var userId = user_id;
    var res1 = await ExpenseItem.find({owe_id:userId,status:0})

    for (var i=0; i<res1.length; i++) {
        let m =  res1[i].money
        var result1 = await GroupPerson.findOne({person_id: res1[i].owed_id,group_id:res1[i].group_id})
        await GroupPerson.findByIdAndUpdate( {_id:result1._id},{$set: {balance:result1.balance-m}})
        var result2 = await GroupPerson.findOne({person_id: userId,group_id:result1.group_id})
        await GroupPerson.findByIdAndUpdate( {_id:result2._id},{$set: {balance:result2.balance+m}})                                  
    }
    var result1 = await ExpenseItem.updateMany({owe_id:userId,status:0},{$set: {status:1}})
    var res2 = await ExpenseItem.find({owed_id:userId,status:0})

    for (var i=0; i<res2.length; i++) {
        let m2 =  res2[i].money
        var result3 = await GroupPerson.findOne({person_id: res2[i].owe_id,group_id:res2[i].group_id})
        await GroupPerson.findByIdAndUpdate( {_id:result3._id},{$set: {balance:result3.balance+m2}})
        var result4 = await GroupPerson.findOne({person_id: userId,group_id:result3.group_id})
        await GroupPerson.findByIdAndUpdate( {_id:result4._id},{$set: {balance:result4.balance-m2}})
    } 
    await ExpenseItem.updateMany({owed_id:userId,status:0},{$set: {status:1}})
    return{message:"settle up success"}

  }
  
  
};