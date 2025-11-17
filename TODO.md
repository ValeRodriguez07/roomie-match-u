# Role-Based Navigation and Main Screens Implementation

## Tasks to Complete

### 1. Modify App.tsx
- [ ] Add role-based tab configuration (seekers: explore, matches, chat, analytics; offerers: publications, matches, chat, analytics)
- [ ] Update profile completion handler to redirect to role-appropriate main screen
- [ ] Implement role-based main screen rendering

### 2. Convert ExploreScreen to RoleBasedMainScreen
- [ ] For seekers: Implement Tinder-like card stack with scroll detection and paywall (6 views limit)
- [ ] For offerers: Show publication management interface with paywall (2 publications limit)
- [ ] Add scroll detection logic for card swiping

### 3. Implement Paywall System
- [ ] Track view counts for seekers (6 free views)
- [ ] Track publication count for offerers (2 free publications)
- [ ] Show paywall UI when limits reached

### 4. Update Navigation Components
- [ ] Modify Header.tsx for role-based desktop navigation
- [ ] Update mobile bottom navigation to reflect role-based tabs

### 5. Add Publication Management for Offerers
- [ ] Create publication creation/editing interface
- [ ] Integrate with usePublications hook

### 6. Ensure Responsive Behavior
- [ ] Test mobile/desktop navigation
- [ ] Verify card interface works on different screen sizes

## Followup Steps
- [ ] Test profile completion flow redirects correctly
- [ ] Verify paywall logic works
- [ ] Test responsive navigation on mobile/desktop
- [ ] Ensure publication management works for offerers
