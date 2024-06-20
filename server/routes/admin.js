const express=require('express');
const router=express.Router();
const Post=require('../models/Post');
const User=require('../models/User');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');

const adminLayout='../views/layouts/admin';
const jwtSecret=process.env.JWT_SECRET;


const authMiddleware=(req,res,next)=>{
const token =req.cookies.token;
if(!token){
    return res.status(401).json({message:'unauthorized'});
}
try{
    const decoded=jwt.verify(token,jwtSecret);
    req.userId=decoded.userId;
    next();

}catch(error){
    return res.status(401).json({message:'unauthorized'});
}




}



router.get('/admin',async(req,res)=>{
   
    try{
        const locals={
            title:"admin",
            description:"simple blog created with MERN"
        }
        res.render('admin/index',{locals,layout:adminLayout});
    
    }catch(error){
        console.log(error);
    
    }
    
       
    });
    router.post('/admin',async(req,res)=>{
   
        try{
            const {username,password}=req.body;
            const user=await User.findOne({username});
            if(!user){
                return res.status(401).json({message:'invalid credentials'});
            }
            const isPasswordValid= await bcrypt.compare(password,user.password);
            if(!isPasswordValid){
                return res.status(401).json({message:'invalid credentials'});
            }
            const token=jwt.sign({iserId:user._id},jwtSecret);
            res.cookie('token',token,{httpOnly:true});
            res.redirect('/dashboard');
            
            
            //res.render('admin/index',{locals,layout:adminLayout});
        
        }catch(error){
            console.log(error);
        
        }
        
           
        });
        router.get('/dashboard',authMiddleware,async(req,res)=>{


            try{

                const locals={
                    title:'dashboard',

description:'simple blog'


                }


const data=await Post.find();
res.render('admin/dashboard',{
    locals,
    data,
    layout:adminLayout
});






            }catch(error){
console.log(error);
            }

                res.render('admin/dashboard');
        });
        router.get('/add-post',authMiddleware,async(req,res)=>{


            try{

                const locals={
                    title:'add post',

description:'simple blog'


                }


const data=await Post.find();
res.render('admin/add-post',{
    locals,
    layout:adminLayout
});






            }catch(error){
console.log(error);
            }

                res.render('admin/dashboard');
        });
        router.put('/edit-post/:id',authMiddleware,async(req,res)=>{


            try{
         await Post.findByIdAndUpdate(req.params.id,{
           title:req.body.title,
           body:req.body.body,
           updatedAt:Date.now()


         });
  



res.redirect(`/edit-post/${req.params.id}`);


            }catch(error){
console.log(error);
            }

                res.render('admin/dashboard');
        });
        router.get('/edit-post/:id',authMiddleware,async(req,res)=>{


            try{
                const locals={
                    title:"edit post",
                    description:"edit content",
                };
        
  
const data=await Post.findOne({_id:req.params.id});



res.render('admin/edit-post',{
    data,
    layout:adminLayout

})


            }catch(error){
console.log(error);
            }

                res.render('admin/dashboard');
        });


        router.post('/add-post',authMiddleware,async(req,res)=>{


            try{

               console.log(req.body);
             try{
                const newPost=new Post({
                    title:req.body.title,
                    body:req.body.body
                });
            

await Post.create(newPost);
res.redirect('/dashboard');
            }catch(error){
                console.log(error);
            }






            }catch(error){
console.log(error);
            }

                res.render('admin/dashboard');
        });
         router.post('/register',async(req,res)=>{
   
        try{
            const {username,password}=req.body;
            const hashedPassword=await bcrypt.hash(password,10);
            try{
                const user=await User.create({username,password:hashedPassword});
                res.status(201).json({message:'user created',user});
            }catch(error){
                if (error.code === 11000){
                    res.status(409).json({ message:'user already in use'});
                }
                res.status(500).json({ message:'internal server error'})
            }
            
            
            //res.render('admin/index',{locals,layout:adminLayout});
        
        }catch(error){
            console.log(error);
        
        }
        
           
        });

router.delete('/delete-post/:id',authMiddleware,async(req,res)=>{
    try{
        await Post.deleteOne({_id:req.params.id});
        res.redirect('/dashboard');
    }catch(error){
        console.log(error);
    }
})

router.get('/logout',(req,res)=>{
    res.clearCookie('token');
    //res.json({message:'logout successful'});
    res.redirect('/admin');
});

module.exports=router;