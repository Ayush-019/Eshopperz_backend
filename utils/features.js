class Features {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  //To search for a particular product by name(gives those product as well whose name contain part of searched name)
  search() {
    const keyword = this.queryStr.keyword
      ? {
          name: {
            $regex: this.queryStr.keyword, //Matches to name even if it is present in some part of that word
            $options: "i", //Makes case insensitive
          },
        }
      : {};

    this.query = this.query.find({ ...keyword });
    return this;
  }

  //To filter Products Category
  filter() {
    const queryCopy = { ...this.queryStr }; //If {...}-->Spread Operator is not used then this.queryStr will passed as a reference. So any change in copy will reflect in original.

    //Remove some Fields
    const removeFields = ["keyword", "page", "limit"];
    removeFields.forEach((key) => delete queryCopy[key]);

    //Filter for Price
    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gt|gte|lte|lt)\b/g, val => `$${val}`);
     
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  pagination(resultPerPage){
      const currentPage = Number(this.queryStr.page) || 1;

      //skip defines how many products to skip to display on a particular page
      const skip = resultPerPage * (currentPage - 1);

      this.query = this.query.limit(resultPerPage).skip(skip);
      return this;
  }
}

module.exports = Features;
