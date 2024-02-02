import {
  IsArray,
  IsNotEmpty,
  IsNumberString,
  IsString,
  Matches,
} from 'class-validator';
const match_explanation: string[] = [
  'Letters (uppercase and lowercase)',
  'Numbers',
  'Spaces',
  'Hyphens',
  'Periods',
  'Commas',
  'Exclamation marks',
  'Ampersands',
  'Parentheses',
  'Curly braces',
  'Square brackets',
  'Equals signs',
  'Question marks',
  'Vertical bars',
  'Forward slashes',
  'Backslashes',
];
export class BlogPayloadType {
  @IsString({ message: 'Incorrect Format For Title.' })
  @IsNotEmpty({ message: 'Blog Title Required.' })
  @Matches(/^[A-Za-z0-9 :'\-\.,!&(){}\[\]=?|\/\\]*$/g, {
    message: `Blog Title Must Only Contain The Following: ${match_explanation}`,
  })
  blog_title: string;
  @IsString({ message: 'Incorrect Format For Intro.' })
  @IsNotEmpty({ message: 'Blog Intro Required.' })
  @Matches(/^[A-Za-z0-9 :'\-\.,!&(){}\[\]=?|\/\\]*$/g, {
    message: `Blog Intro Must Only Contain The Following: ${match_explanation}.`,
  })
  blog_intro: string;
  @IsString({ message: 'Incorrect Format For Body.' })
  @IsNotEmpty({ message: 'Blog Body Required.' })
  @Matches(/^[A-Za-z0-9 :;'\-\.,!&(){}\[\]=?|\/\\]*$/g, {
    message: `Blog Body Must Only Contain The Following: ${match_explanation}.`,
  })
  blog_body: string;
  @IsString({ message: 'Incorrect Format For Outro.' })
  @IsNotEmpty({ message: 'Blog Outro Required.' })
  @Matches(/^[A-Za-z0-9 :'\-\.,!&(){}\[\]=?|\/\\]*$/g, {
    message: `Blog Outro Must Only Contain The Following: ${match_explanation}.`,
  })
  blog_outro: string;
  @IsString({ message: 'Incorrect Format For Summary.' })
  @IsNotEmpty({ message: 'Blog Summary Required.' })
  @Matches(/^[A-Za-z0-9 :'\-\.,!&(){}\[\]=?|\/\\]*$/g, {
    message: `Blog Summary Must Only Contain The Following: ${match_explanation}.`,
  })
  blog_summary: string;
  @IsNotEmpty({ message: 'Author Name Required.' })
  @IsString({ message: 'Incorrect Format For Author.' })
  @Matches(/^[A-Za-z0-9 ]*$/, { message: 'Name Must Only Be Alphanumeric.' })
  blog_author_name: string;
  @IsNotEmpty({ message: 'Category Required.' })
  @IsNumberString({}, { message: 'Incorrect Format For Category.' })
  category_id: number;
  @IsNotEmpty({ message: 'At Least One Sub Category Is Required.' })
  @IsArray({ message: 'Must Be An Array.' })
  sub_categories: number[];
}
export class FinalBlogPayloadType {
  blog_title: string;
  blog_intro: string;
  blog_body: string;
  blog_outro: string;
  blog_summary: string;
  user_id: number;
  blog_author_name: string;
  category_id: number;
}
/*
id: number;
blog_title: string;
blog_intro: string;
blog_body: string;
blog_outro: string;
blog_summary: string;
user_id: number;
blog_author_name: string;
category_id: number;
created_at: Date;
updated_at: Date;
*/
