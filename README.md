Structure of my e-commerce website website

Back-end components: 
Controllers
Database
Middlewares
Models
Routes
Index.js

1. Controllers:



## Requirements to be done

- When customers visit the website, they can see pictures and names of all the things they can buy, like shirts, necklaces, and phones.



## Requirements to be done

- When a customer clicks on a product, it shows you more pictures, what it's made of, how much it costs, and what other people think about it.



## Requirements to be done

- Customers can look in their cart anytime and decide if they want to keep all the things or take some time out



## Requirements to be done

- When a customer is ready to buy, they can put in their address and how they want to pay, and then they get their products!



## Requirements to be done

- Customers can sign up by giving their name and email, so next time it's faster to log in and shop.



## Requirements to be done

- A customer can write what they think about the stuff they bought to help other people decide if they want it too.



## Requirements to be done

- Admins can put new clothes, jewellery, and electronics in the store with pictures and prices.



## Requirements to be done

- Admins can take things off the shelf if they aren't available anymore.



## Requirements to be done

- Admins can look at what people have bought and help if something goes wrong.

1. Database



## Requirements to be done

- The database shows you the name of the product, a picture of a product and how much it costs.



## Requirements to be done

- There will be a description to see how many products are left in stock, and more details about how some products work, like electronics.



## Requirements to be done

- When customers buy a product, the database will remember their name, where to send the package, and how they like to pay. If they paid before, their payment details will remain.



## Requirements to be done

- The database keeps a list of everyting a customer purchased, to see their past orders.



## Requirements to be done

- After purchasing a product, a customer can give stars and write what they think about the product.



## Requirements to be done

- Customers can read what other people's views about the items in the store and see the stars they gave.

1. Middleware
  !-- Customers will need to be logged in to be able to place their orders and purchase items. -->



## Requirements to be done

- Customers will input their username and password to log in.



## Requirements to be done

- Only admins can access to add new items or change what's already in store.



- The website will ensure a customer types their details correctly.

1. Middlewares



## Requirements for the epic to be done

- A sign-up page where the user enters information about themselves to be authenticated on the platform.
- A sign-in page where the user enters their sign-in information to be authenticated on the platform.
- A forgot password page where the user enters their email and link is sent to them to enter a new password.
- A reset password page where the user will enter their new password.



# Story | Sign-Up

As a new user, I want to have a sign-up page that allows me to add my first name, last name, email, password and a place to confirm my password. I then want to click a Sign-up button that will allow me to have a user on the platform. After a successful sign-up, I want to be redirected to the home page.

## Technical Requirements:



### Backend



#### Users Table



We will need a table in the database called `users` that has the following:

- id
- firstName
- lastName
- email
- password
- createdAt
- modifiedAt

We will need the following endpoint(s) to sign-up a user:

#### POST authentication/sign-up



The endpoint will take the following values in the body:

- firstName
  - Validation:
    - String
    - Mandatory
- lastName
  - Validation:
    - String
    - Mandatory
- email
  - Validation:
    - String
    - Email
    - Mandatory
- password
  - Validation:
    - String
    - Should be a minimum of 8 characters and contain 1 uppercase, 1 lowercase, 1 special character
    - Mandatory

The following data will be returned on a successful sign-up:

- id
- firstName
- lastName
- email
- token
- refreshToken



### Frontend



Create a stylised page with the following

- First Name
  - Validation:
    - Input Text
    - Mandatory
- Last Name
  - Validation:
    - Input Text
    - Mandatory
- Email
  - Validation:
    - Input Email
    - Email
    - Mandatory
- Password
  - Validation:
    - Input Password
    - Should be a minimum of 8 characters and contain 1 uppercase, 1 lowercase, 1 special character
    - Mandatory
- Confirm Password
  - Validation
    - Same as password
    - Mandatory
- Button
  - Text: Sign-Up
  - Integrate this button with the `POST authentication/sign-up` endpoint.
- Link
  - Text: Sign-In
  - This will take the user back to the Sign-In page.

When a user has successfully signed up, route them to the home page.

## Dev Checklist



- [x] Backend: Add Users Table
- [x] Backend: Add `POST authentication/sign-up` endpoint
- [x] Frontend: Add a Sign-up page with styling
- [x] Frontend: Add validation to Sign-up page
- [x] Frontend: Integrate with the `POST authentication/sign-up` endpoint