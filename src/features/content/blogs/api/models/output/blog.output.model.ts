export class BlogOutputModel {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
}

// MAPPERS

export const BlogOutputModelMapper = (blog): BlogOutputModel => {
  const outputModel: BlogOutputModel = new BlogOutputModel();

  console.log(blog);

  outputModel.id = blog.id;
  outputModel.name = blog.name;
  outputModel.description = blog.description;
  outputModel.createdAt = blog.created_at;
  outputModel.websiteUrl = blog.website_url;
  outputModel.isMembership = blog.is_membership;

  return outputModel;
};

// export const BlogOutputModelMapper = (blog): BlogOutputModel => {
//   const outputModel: BlogOutputModel = new BlogOutputModel();
//
//   outputModel.id = blog.id;
//   outputModel.name = blog.name;
//   outputModel.description = blog.description;
//   outputModel.createdAt = blog.createdAt.toISOString();
//   outputModel.websiteUrl = blog.websiteUrl;
//   outputModel.isMembership = blog.isMembership;
//
//   return outputModel;
// };
