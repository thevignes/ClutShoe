const Category = require('../../models/category')

const CategoryDet = async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;
 page
    const limit = 6;  
    const startIndex = (page - 1)
    // console.log(`Fetching categories for page: ${page}, limit: ${limit}`);
  
    const categoryData = await Category.find( {isDelete:false})
      .sort({ createdAt: -1 }) 
      .skip(startIndex)  
      .limit(limit); 

    const totalCate = await Category.countDocuments({isDelete:false});

    const totalPages = Math.ceil(totalCate / limit);

    res.render('category', {
      cate: categoryData,
      CurrentPage: page,
      TotalPages: totalPages, 
      totalCate: totalCate,
      limit: limit
    });
  } catch (error) {
    console.log(error);
    res.send('Error in getting category data');
  }
};


const addCategory = async (req,res) =>{
    const {name,description} = req.body;
   
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

const editCatePage = async (req, res) => {
  try {
    const id = req.params.id;
    const category = await Category.findById(id,{isDelete:false}); 
    if (!category) {
      return res.status(404).send('Category not found');
    } 
   
    res.render('editCategory', { category });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

const editCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const id = req.params.id;
    const category = await Category.findByIdAndUpdate(id, { name, description }, { new: true });
    if (!category) {
      return res.status(404).send({ message: "Category not found" });
    }

    // console.log(category, " is edited");

    return res.redirect('/admin/category'); 
  } catch (error) {
    return res.status(500).send({ error: "Internal server error" });
  }
};

///deleting category SoftDelete

const CategoryDelete = async (req, res) => {
  const id = req.params.id;
  console.log('The ID is', id);

  try {

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).send({ message: "Category not found" });
    }

   
    const updatedCategory = await Category.findByIdAndUpdate(id, {
      isDelete: true,
      deletedAt: Date.now()
    }, { new: true });

    console.log("Deleted category:", id);


    return res.redirect('/admin/category');
  } catch (err) {
    console.log(err, "while deleting the category");
    return res.status(500).send('Server error. Please try again.');
  }
};

const CategoryList = async (req,res)=>{
  
  const id = req.params.id
  try {
    const Updatecate = await Category.findByIdAndUpdate(id,{
      isListed:true
    },{new:true})
    res.redirect('/admin/category')

    console.log("the listed category is :",Updatecate)
  } catch (error) {
    console.log(error)
    res.status(500).send('Server error. Please try again.')
  }
}

const UnCategoryList = async (req,res)=>{
  const id = req.params.id;
  try {
    const Updatecate = await Category.findByIdAndUpdate(id,{
      isListed:false
    },{new:true})
    res.redirect('/admin/category' )
    
    console.log("the listed category is :",Updatecate)
  } catch (error) {
    console.log(error)
    res.status(500).send('Server error. Please try again.')
  }
}




module.exports = {
    CategoryDet,
    addCategory,
    editCategory,
    editCatePage,
    CategoryDelete,
    CategoryList,
    UnCategoryList
    

}