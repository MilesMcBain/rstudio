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

# Solution(?)

* Create an event: [ScrollConsoleEvent](../src/gwt/src/org/rstudio/studio/client/workbench/views/console/events/ScrollConsoleEvent.java)
* Add it to the event bus with other similar events in [Shell](../src/gwt/src/org/rstudio/studio/client/workbench/views/console/shell/Shell.java)
  - to handle the event we want to call a scrollConsole() method on the view_. This means [ShellDisplay] must declare the method
* Declare scrollConole() in [ShellDisplay](../src/gwt/src/org/rstudio/studio/client/common/shell/ShellDisplay.java) 
  - This means the [ShellWidget](../src/gwt/src/org/rstudio/studio/client/common/shell/ShellWidget.java) must define scrollConsole()
* Define scrollConsole() in [ShellWidget]
  - Uses some calls on the input_ [DocDisplay](../src/gwt/src/org/rstudio/studio/client/workbench/views/source/editors/text/DocDisplay.java) ([AceEditor]) to implement the method.
  - could also push down some methods for scrollUp(), scrollDown() into the [DocDisplay] interface and implement in [AceEditor] if the methods used don't do what I think they do.
* Define abstract app commands in [Commands](../src/gwt/src/org/rstudio/studio/client/workbench/commands/Commands.java):
  - scrollConsoleUp()
  - scrollConsoleDown()

TODO:
* Hook up commands to implementations
  - This is a bit special, described in [CommandBinder](../src/gwt/src/org/rstudio/core/client/command/CommandBinder.java)
  - To find the right binder implementation look for the other onThing methods relating to the console commands?
* Declare commands in Commands.cmd.xml