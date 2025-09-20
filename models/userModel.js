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
    enum: ['citizen', 'staff'],  
  },

  profile : {
    address: { type: String },
    phone: { type: String },
  },

  department: {
    type: String,
  },

    issuess:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"issues"
    },

    notification:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"notification"
    }

    
})

export const userModel=mongoose.model('user',userSchema) 