# Backend Overview

This backend is a REST API with an MVC architecture using NestJS.

It is a robust backend with stringent security handling such as but not limited to:
- IP watchlisting
- IP blacklisting
- Ratelimiting
- JWT
- Restricted routes
- RBAC.

Also, this API applies **SOLID principles**, which really adds to the efficacy of the MVC architecture.

**NestJS** is the applied framework because at the growing scale of this platform, an opinionated framework is the best way to go.

This platform does not outsource any backend service, everything is done from scratch.

So far, this API has:
- Authentication and authorization feature
- Actual blog module which deals with the post of the blog.
  - This endpoint has a lot of cool features, such as but not limited to validating the inputs and also the files upload. 
    - This only allows PNG and JPG/JPEG files, validates not only their mime types, their magic numbers, but also the data structures of each file type (ihdr, iend, etc.). 
    - There are a variety of things happening under the hood, so feel free to check it out, but essentially the uploaded files are validated many times over and will catch fake forged JPEG and PNG files. 
    - This was probably my favorite module I got to do because I learned a lot and had never had to validate files at a production level.
- Cron jobs which expel extraneous data from the database.
- Pre-commit hooks ensuring no proprietary data is leaked through a commit.

This API is still a work in progress and will be pretty sizeable by the time it's done. I have really focused on optimization and performance; therefore, I have been very selective about refactoring and what libraries I am utilizing.
