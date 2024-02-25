import express, { Request, Response } from 'express';
import dotenv from "dotenv"
import connectDB from './db/db';
import { app } from './app';

dotenv.config()


connectDB().then(()=>{
    app.listen(process.env.PORT||4000,()=>{
        console.log("Server is running on port " + process.env.PORT)
    })
}).catch(()=>{
    console.log("MongoDB connection failed from Server.ts")
});