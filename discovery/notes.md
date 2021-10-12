I am trying to see if I can hack my way through a simple PR to RStudio for a new
command to scroll the console without switching to it, which could be bound to a keyboard shortcut.

# Similar PRs:

https://github.com/rstudio/rstudio/pull/4853/files adds a word count command.

# Defining commands

[All commands with permitted contexts](../src/gwt/src/org/rstudio/studio/client/workbench/commands/Commands.cmd.xml)

[Command interfaces](../src/gwt/src/org/rstudio/studio/client/workbench/commands/Commands.java)

[Handlers for commands](../src/gwt/src/org/rstudio/studio/client/workbench/views/source/editors/text/TextEditingTarget.java)

# Code execution 

[Code execution for text editing target](../src/gwt/src/org/rstudio/studio/client/workbench/views/source/editors/EditingTargetCodeExecution.java)
  - executeRange() for executing code

[send to console event](../src/gwt/src/org/rstudio/studio/client/workbench/views/console/events/SendToConsoleEvent.java)

[send to console implementation](../src/gwt/src/org/rstudio/studio/client/workbench/views/console/shell/Shell.java)

# Console Classes

[Display of console interface](../src/gwt/src/org/rstudio/studio/client/workbench/views/console/shell/editor/InputEditorDisplay.java)

  - This seems to have the right flavour of methods for console manipulation:
    - isCursorAtEnd()
    - getBounds()
    - etc.
  - Missing a setBounds()

  - The [AceEditor](../src/gwt/src/org/rstudio/studio/client/workbench/views/source/editors/text/AceEditor.java) implements this interface, but it also seems to be able to represent all the editors in the IDE. It has tons of methods relating to scrolling.
    

[Shell widget which contains an ace editor](../src/gwt/src/org/rstudio/studio/client/common/shell/ShellWidget.java)

# Question

How to pass an event to the AceEditor for the console from the source editor triggered by a command? I could use that event to trigger various scroll behaviours?
