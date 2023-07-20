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

[ ] Create debug mode
    [ ] What does debug mode do?
        [ ] Debug mode should send data to a debug worksheet
        [ ] User should be able to delete the debug worksheet knowing he doesn't lose any data
        [ ] Debug worksheets should have a name that clearly explains they are debug related
    [ ] Find how to setup a debug mode
        [ ] Find where would this setting fit in the extension main file
    [ ] In debug mode the data of a google worksheet is reset all time
    [ ] Bonus, maybe create a new worksheet for each debug session?
    [ ] Include in settings whether we are in debug mode

[x] Send update data to Google Sheets
    [x] Make it an update per session - workspace values
    [x] Include last track time in Italian time
    [ ] Create the file that will contain the data on Google Drive

## Lower priority
[ ] Include more in event stats
    [ ] Which files have been the user focusing on?

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