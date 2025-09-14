import mongoose from "mongoose";

const userSchema=mongoose.Schema({

    name:{
        type:String
    },
    email:{
        type:String
    },
    password:{
        type:String
    },

    role: { 
    type: String, 
    enum: ['citizen', 'staff', 'admin'], 
    default: 'citizen' 
  },

    issuesss:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"issues"
    },

    notification:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"notification"
    }

    
})

export const userModel=mongoose.model('user',userSchema) 