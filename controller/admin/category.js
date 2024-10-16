const Category = require('../../models/category')


const CategoryDet = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 4;
      const startIndex = (page - 1) * limit;
  
      const categoryData = await Category.find({})
        .sort({ createdAt: -1 })
        .skip(startIndex)  
        .limit(limit);
  
      const totalCate = await Category.countDocuments();
      const totalPages = Math.ceil(totalCate / limit);
  
      res.render('category', {
        cate: categoryData,
        currentPage: page,
        TotalPages: totalPages, 
        totalCate: totalCate,
      });
    } catch (error) {
      console.log(error);
      res.send('Error in getting category data');
    }
  };
  

const addCategory = async (req,res) =>{
    const {name,description} = req.body;
    console.log('hehheheheh catewf')
    try {
        const exisitngCate = await Category.find({name})
        if(exisitngCate.length > 0){
            return res.status(400).json({error:'Category already exists'})
        }
        const newCategory = new Category({name,description})
        await newCategory.save()
        console.log(newCategory)
        return res.json({message:"category added"})
       
    } catch (error) {
        return res.status(500).json({error:"internal server error"})
    }
}
module.exports = {
    CategoryDet,
    addCategory
}