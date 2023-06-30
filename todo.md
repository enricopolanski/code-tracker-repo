[x] Activate extension at startup
[x] Create status bar to play/pause activity tracking
[x] Understand how to create Output channel
[x] Afk tracker: after x seconds of inactivity put state in afk
[x] After coming back from AFK the system is no longer idle
[x] If user is not idle, every 15 seconds create the output thing
[x] Add counter with total session active time

# Events

[ ] Listen to other UI interactions (those should also signal that the user is currently active)
    [ ] Check whether we can track menus opening/closing, the debugger, etc
        [ ] Check whether we can track the user opening/closing the terminal
        [ ] Check whether we can track the user opening/closing the explorer
        [ ] Check whether we can track the user opening/closing the search
        [ ] Check whether we can track the user opening/closing the source control
        [ ] Check whether we can track the user opening/closing the extensions
        [ ] Check whether we can track the user opening/closing the debug menu
        [ ] Check whether we can track the user opening/closing the output
        [ ] Check whether we can track the user opening/closing the problems
        [ ] Check whether the user has been modifying the settings
        [ ] Check whether the user has been modifying the theme
        [ ] Check whether the user has been modifying the keybindings
        [ ] Check whether the user has been modifying the extensions
        [ ] Check whether the user has been modifying the workspace
        [ ] Check whether the user has been modifying the window
        [ ] Check whether the user has been modifying the file
        [ ] Check whether the user has been modifying the search
        [ ] Check whether the user has been modifying the scm
        [ ] Check whether the user has been modifying the debug
        [ ] Check whether the user has been modifying the extensions
        [ ] Check whether the user has been modifying the view
        [ ] Check whether the user has been modifying the help
        [ ] Check whether the user has been modifying the editor

# Saving stats

## Higher priority

[ ] Send update data to Google Sheets
    [ ] Get a first version working and commit

### Lower priority

[ ] Send update data to Cloudflare
[ ] Send update to PostgreSQL (via neon?)

# Settings

## Higher priority

[ ] Understand how to pass settings via VSCode settings.json file (or via extension settings)
[ ] Understand how to retrieve settings from VSCode settings.json file (or via extension settings) in our extension

### Lower priority

[ ] Understand how to make settings page like in Quokka extension

# Publish and test

## Higher priority
[ ] Add extension to our own vscode

## Lower priority
[ ] Bring back learnings to `trackeo` repo
<!-- [ ] Check stuff about sessionid (? Unclear) -->

# Learning

[ ] Complete service tutorial on effect's website