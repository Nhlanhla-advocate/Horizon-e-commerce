Structure of my e-commerce website website

Back-end components: 
Controllers
Database
Middlewares
Models
Routes
Index.js


1. Controllers: 
<!-- Customers will be able to see cool stuff like clothes, jewellery, and gadgets so that customers can be able to pick what they want to buy. -->

## Requirements to be done
- When customers visit the website, they can see pictures and names of all the things they can buy, like shirts, necklaces, and phones.

<!-- Customers will want to look at more details about things they like, to make it easier to decide if they want to buy it. -->

## Requirements to be done
- When a customer clicks on a product, it shows you more pictures, what it's made of, how much it costs, and what other people think about it.

<!-- Customers will want to put their favorite things in their shopping carts, so that they can save them and buy them later. -->

## Requirements to be done
- Customers can look in their cart anytime and decide if they want to keep all the things or take some time out

<!-- Customers will want to check out and pay to get the things they like. -->

## Requirements to be done
- When a customer is ready to buy, they can put in their address and how they want to pay, and then they get their products!

<!-- Customers must make an account, so that they can save their info and look at their past orders. -->

## Requirements to be done
- Customers can sign up by giving their name and email, so next time it's faster to log in and shop.

<!-- A customer would want to leave a review, so that they can tell others if they liked what they bought. -->

## Requirements to be done
- A customer can write what they think about the stuff they bought to help other people decide if they want it too.

<!-- An admin can be able to add new things to the store, so that customers can have more options to choose from. -->

## Requirements to be done
- Admins can put new clothes, jewellery, and electronics in the store with pictures and prices. 

<!-- An admin would want to remove things from the store. So that old and unavailable items are not shown. -->

## Requirements to be done
- Admins can take things off the shelf if they aren't available anymore.

<!-- An admin would want to see customer orders, so that they can help customers if they need a certain item or if there is a problem with their order. -->

## Requirements to be done
- Admins can look at what people have bought and help if something goes wrong.

2. Database
<!-- Customers would want to see the name, picture, and price of of the things I want to buy, so that they know what they are and how much they cost. -->

## Requirements to be done
- The database shows you the name of the product, a picture of a product and how much it costs.

<!-- Customers would want to see more details about the things they want to buy, so that they can decide if they want to buy it. -->

## Requirements to be done
- There will be a description to see how many products are left in stock, and more details about how some products work, like electronics.

<!-- Customers would want the website to remember their details like their name,address and ways on how to pay, so that they don't have to type it in every time. -->

## Requirements to be done
- When customers buy a product, the database will remember their name, where to send the package, and how they like to pay. If they paid before, their payment details will remain.

<!-- Customers would want to see all the things they purchased before, so that they can remember what they ordered. -->

## Requirements to be done
- The database keeps a list of everyting a customer purchased, to see their past orders.

<!-- Customers would want to leave reviews about the things they purchased, to let others know how good or bad the products are. -->

## Requirements to be done
- After purchasing a product, a customer can give stars and write what they think about the product.

<!-- Customers would want to see what other people think about the items in the website. -->

## Requirements to be done
- Customers can read what other people's views about the items in the store and see the stars they gave.

3. Middleware
 <!-- Customers will need to be logged in to be able to place their orders and purchase items. -->

## Requirements to be done
- Customers will input their username and password to log in.

<!-- Admins will special permission to add or change things. -->

## Requirements to be done
- Only admins can access to add new items or change what's already in store.

<!-- Customers may need the website to check if they are typing the right information, like their username, email and payment details. -->


- The website will ensure a customer types their details correctly.

3. Middlewares
<!-- We now move on to high leve requirements for the feature that will give it the definition of done stamp. In the authentication feature it will be a working authentication flow that includes the API endpoints and the webpages on frontend -->
## Requirements for the epic to be done
- A sign-up page where the user enters information about themselves to be authenticated on the platform.
- A sign-in page where the user enters their sign-in information to be authenticated on the platform.
- A forgot password page where the user enters their email and link is sent to them to enter a new password.
- A reset password page where the user will enter their new password.

# Story | Sign-Up
As a new user, I want to have a sign-up page that allows me to add my first name, last name, email, password and a place to confirm my password. I then want to click a Sign-up button that will allow me to have a user on the platform. After a successful sign-up, I want to be redirected to the home page.

## Technical Requirements:
<!-- In here we break down what technical requirements are needed. And here you will see that we do not explicity say create this controller and that model etc. as that is self implied. -->
### Backend
#### Users Table
<!-- Here we will add all the fields that will need to go into the database, if they need a specific type then this can be added here as well -->
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
<!-- Here you will add all the information that is needed for your endpoint. If you have query parameters add the information for that here too. -->
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
<!-- Here you will give information on what you see on the page and if there is validation you can add that too. And if there are buttons or links, what is their text and what do they do. -->
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
<!-- A quick checklist of the work that was set out and for you to keep track of where you are.   -->
- [ ] Backend: Add Users Table
- [ ] Backend: Add `POST authentication/sign-up` endpoint
- [ ] Frontend: Add a Sign-up page with styling
- [ ] Frontend: Add validation to Sign-up page
- [ ] Frontend: Integrate with the `POST authentication/sign-up` endpoint