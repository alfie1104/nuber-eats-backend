# Nuber Eats

The Backend of Nuber Eats Clone

- Edit Restaurant
- Delete Restaurant

- See Categories
- See Restaurants by Category (pagination)
- See Restaurants (pagination)
- See Restaurant
- SEarch Restaurant

- Create Dish
- Edit Dish
- Delete Dish

- Orders CRUD
- Orders Subscription

  - s : subscribing , t: trigger
  - Pending Orders (Owner) [s :newOrder, t : createOrder(newOrder)]
  - Order status (Customer, Delivery, Owner) [s : orderUpdate, t : editOrder(orderUpdate)]
  - Pending Pickup Order (Delivery) [s :orderUpdate, t : editOrder(orderUpdate)]

- Payments (CRON)

## User Entity :

- id
- createdAt
- updatedAt

- email
- password
- role(client|onwer|delivery)

## User CRUD:

- Create Account
- Log In
- See Profile
- Edit Profile
- Verify Email

## Restaurant Model

- name
- category
- address
- coverImage
