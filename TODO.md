# Currency Integration TODO

## 1. Update Type Definitions
- [ ] Add currency field to UserPreferences interface
- [ ] Add currency field to User interface
- [ ] Add currency field to Publication interface
- [ ] Define supported currencies type

## 2. Update Registration Process
- [ ] Add currency selection to LoginScreen registration form
- [ ] Update user registration logic to include currency
- [ ] Add currency options for all countries in the app

## 3. Add Currency Selector to Header
- [ ] Add currency dropdown to Header component
- [ ] Implement currency change handler
- [ ] Store selected currency in app context

## 4. Create Currency Conversion Service
- [ ] Create currency conversion utility/service
- [ ] Add exchange rates for supported currencies
- [ ] Implement conversion functions

## 5. Update Price Display Components
- [ ] Update PublicationCard to show prices in selected currency
- [ ] Update TinderCard to show prices in selected currency
- [ ] Update ProfileBuilder to handle currency in price fields
- [ ] Update ExploreScreen price displays

## 6. Update Mock Data
- [ ] Add currency fields to mock users
- [ ] Add currency fields to mock publications
- [ ] Ensure all price displays work with conversion

## 7. Update Translations
- [ ] Add currency-related translations
- [ ] Add currency symbols and names

## 8. Testing
- [ ] Test currency conversion accuracy
- [ ] Test currency switching in all components
- [ ] Test registration with currency selection
