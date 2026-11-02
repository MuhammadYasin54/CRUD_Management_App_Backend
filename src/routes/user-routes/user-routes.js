// "All user related routes are defined here...!"

import express from "express"
import { greetUser, createUser, addBulkData, handleCheckOut ,fetchUsersPerPage, handleSendEmail ,fetchUsers,fetchUsersById, handleDeleteUser, fetchSingleUsers, updateUser, deleteAllUser, handleLogin, uploadMedia,uploadMediaFile } from "../../controller/user-controller/user-controller.js"
// import checkAuthenticated from "../../custom-middleware/custom-middleware.js";


const router = express.Router();

router.route("/").get(greetUser);
router.route("/user/save").post(createUser)
router.route("/user/fetch").get(fetchUsers)
router.route("/add/bulk/users").post(addBulkData);
router.route("/send/mail").post(handleSendEmail);
router.route("/check-out/session").post(handleCheckOut);
router.route("/user/fetch/perpage").get(fetchUsersPerPage)
router.route("/user/fetch/:uid").get(fetchUsersById)
router.route("/user/fetch/:uid").get(fetchSingleUsers)
router.route("/user/delete/:uid").delete(handleDeleteUser);
router.route("/user/update").put( updateUser)
router.route("/user/deleteall").delete( deleteAllUser)
router.route("/user/login").post(handleLogin)
router.route("/api/profile/upload").post(uploadMedia, uploadMediaFile)

export default router;