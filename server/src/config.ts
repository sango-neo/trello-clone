import dotenv from 'dotenv';

dotenv.config();


// export const secret = 'secret';

export const env = {
    secret: process.env.JWT_SECRET,
    port: process.env.PORT,
    dbURI: process.env.MONGODB_URI,
    prod_dbURI: process.env.MONGODB_URI_PROD
}

