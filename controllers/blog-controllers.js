const _ = require("lodash");
const HttpError = require("../models/http-error");

const getStats = async (req, res, next) => {
  try {
    const response = await fetch(
      "https://intent-kit-16.hasura.app/api/rest/blogs",
      {
        method: "GET",
        headers: {
          "x-hasura-admin-secret":
            "32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6",
        },
      }
    );

    if (!response.ok) {
      const error = new HttpError("Error fetching blog data from server", 500);
      return next(error);
    }

    const allBlogData = await response.json();

    const blogData = allBlogData.blogs;

    const numberOfBlogs = Object.keys(blogData);

    const maxLenBlog = _.maxBy(blogData, "title.length");

    const blogsWithPrivacy = _.filter(blogData, (blog) =>
      blog.title.toLowerCase().includes("privacy")
    );

    const uniqueBlogTitles = _.uniqBy(blogData, "title");

    res.json({
      numberOfBlogs: numberOfBlogs.length,
      maxLenBlogTitle: maxLenBlog.title,
      numberOfBlogsWithPrivacy: blogsWithPrivacy.length,
      uniqueBlogTitles: uniqueBlogTitles.map((blog) => blog.title),
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the request." });
  }
};

const blogSearch = async (req, res, next) => {
  // Fetch the data from the server
  let response;
  try {
    response = await fetch("https://intent-kit-16.hasura.app/api/rest/blogs", {
      method: "GET",
      headers: {
        "x-hasura-admin-secret":
          "32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6",
      },
    });
  } catch (err) {
    res.status(500).json({ error: `Error fetching the data from the server.` });
  }

  if (!response.ok) {
    const error = new HttpError("Error fetching blog data from server", 500);
    return next(error);
  }

  // Data Processing
  let blogData;
  let matchingBlogs;
  try {
    const allBlogData = await response.json();

    blogData = allBlogData.blogs;

    const query = req.query.query.toLowerCase();

    matchingBlogs = blogData.filter((blog) =>
      blog.title.toLowerCase().includes(query)
    );
  } catch (err) {
    res.status(500).json({ error: `Error processing the data.` });
  }

  res.json(matchingBlogs);
};

// The resolver function is used to generate a unique key for the memoized function.
const resolver = async (req, res, next) => req.query.query.toLowerCase();

// Use memoize to store the result for 8 seconds.
const memoizedBlogSearch = _.memoize(blogSearch, resolver, 8000);

// Export the controller functions
exports.getStats = getStats;
exports.memoizedBlogSearch = memoizedBlogSearch;
