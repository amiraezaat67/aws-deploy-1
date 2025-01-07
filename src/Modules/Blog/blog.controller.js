


import { Router } from "express";
import * as BlogServices from "./Services/blog.service.js";

const blogController = Router();

blogController.post('/add', BlogServices.addBlogService)
blogController.get('/list', BlogServices.listBlogsService)
blogController.delete('/delete/:id', BlogServices.destroyBlogService)
blogController.patch('/restore/:id', BlogServices.restoreBlogService)

export default blogController