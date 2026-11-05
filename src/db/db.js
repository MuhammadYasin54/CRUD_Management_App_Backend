import mongoose from "mongoose";

const connectedDb =async () =>{
try {
    const res = await mongoose.connect(

        process.env.DB_URL,
        {
            dbName: "CRUDDB"
        }
        
    )
    res && console.log("Mongo Db Connected Successfully...!")
    
} catch (error) {
    console.log("Something went wrong while connecting Db", error)
    throw error;
}
}

export default connectedDb;
