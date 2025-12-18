const Image = require('../model/Image');
const { uploadToCloudinary } = require('../helpers/cloudinaryHelper');
const fs = require('fs');
const fsPromises = fs.promises;
const cloudinary = require('../config/cloudinary')
const uploadImageController = async (req, res) => {
    const localPath = req.file?.path;

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'File is required! Please upload an image.'
        });
    }

    try {
        // Upload to Cloudinary
        const { url, publicId } = await uploadToCloudinary(localPath);

        // Save metadata
        const newlyUploadedImage = new Image({
            url,
            publicId,
            uploadedBy: req.userInfo && req.userInfo.userId ? req.userInfo.userId : null
        });

        await newlyUploadedImage.save();

        res.status(201).json({
            success: true,
            message: 'Image uploaded successfully',
            image: newlyUploadedImage
        });
    } catch (error) {
        // Log full error to server console for debugging
        console.error('uploadImageController error:', error);
        // Return error.message to aid debugging (remove in production)
        return res.status(500).json({
            success: false,
            message: error.message || 'Something went wrong while uploading image.'
        });
    } finally {
        // Ensure local file is removed when present
        try {
            if (localPath && fs.existsSync(localPath)) {
                await fsPromises.unlink(localPath);
            }
        } catch (unlinkErr) {
            console.error('Failed to delete local file:', unlinkErr);
        }
    }
};

const fetchImagesController = async(req,res) =>{
    try{
        // image-pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page -1) * limit
        const sortBy = res.query.sortBy || 'createdAt'
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        const totalImages = await Image.countDocuments();
        const totalPages = Math.ceil(totalImages / limit);

        const sortObj = {};
        sortObj[sortBy] = sortOrder
        const images = await Image.find().sort(sortObj).skip(skip).limit(limit);

        if(images){
            res.status(200).json({
                success: true,
                currentPage:page,
                totalPages: totalPages,
                totalImages: totalImages,
                data: images,
            })
        }
    }
    catch(error){
        console.log(error);
        res.status(500).json({
            success : false,
            message : 'Something went wrong...'
        })
    }
}

const deleteImageController = async(req,res)=>{
    try{
        const getCurrentIdOfImageToBeDeleted = req.params.id;
        const userId = req.userInfo.userId;

        const image = await Image.findById(getCurrentIdOfImageToBeDeleted);

        if(!image){
            return res.status(404).json({
                status:false,
                message: "image not found..."
            })
        }
        // check if this image is uploaded by the current user who is trying to delete the image
        if(image.uploadedBy.toString != userId){
            return res.status(403).json({
                success: false,
                message:'You are not authorized to delete this image'
            })
        }
        // delete this image first from your cloudinary stroage
        await cloudinary.uploader.destroy(image.publicId);

        // delete this image from mongoDb
        await Image.findByIdAndDelete(getCurrentIdOfImageToBeDeleted)

        res.status(200).json({
            success: true,
            message:'Image deleted successfully...'
        })
    }catch(error){
        console.log(error);
        res.status(500).json({
            success : false,
            message : 'Something went wrong...'
        })
    }
}

module.exports = {uploadImageController,fetchImagesController,deleteImageController};