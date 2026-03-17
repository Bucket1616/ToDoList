/**
 * Tool is used to insert a ToDoList template.
 *
 * @class
 * @extends ve.ui.ToDoListTemplateTool
 *
 * @constructor
 * @param {OO.ui.ToolGroup} toolGroup
 * @param {Object} [config] Configuration options
 */

( function () {
    // Register command for <todo> (Checkbox)
    ve.ui.commandRegistry.register(
        new ve.ui.Command(
            'todo', 'mwWikitext', 'toggleWrapSelection',
            { before: '<todo>', after: '' }
        )
    );

    // Define Tool for <todo> (Checkbox)
    function ToDoListTool() {
        ToDoListTool.super.apply( this, arguments );
    }
    OO.inheritClass( ToDoListTool, ve.ui.MWWikitextTool );
    ToDoListTool.static.name = 'todolist';
    ToDoListTool.static.group = 'insert';
    ToDoListTool.static.icon = 'check'; // Standard checkmark icon
    ToDoListTool.static.title = 'Checkbox'; // Displayed in VE Insert menu
    ToDoListTool.static.commandName = 'todo';
    ve.ui.toolFactory.register( ToDoListTool );

    // --- New code for <todocircle> (Checkcircle) ---

    // Register command for <todocircle>
    ve.ui.commandRegistry.register(
        new ve.ui.Command(
            'todocircle', 'mwWikitext', 'toggleWrapSelection',
            { before: '<todocircle>', after: '' } // Inserts <todocircle>
        )
    )

    // Define Tool for <todocircle>
    function ToDoListCircleTool() {
        ToDoListCircleTool.super.apply( this, arguments );
    }
    OO.inheritClass( ToDoListCircleTool, ve.ui.MWWikitextTool );
    ToDoListCircleTool.static.name = 'todolist-circle'; // Unique internal name for the tool
    ToDoListCircleTool.static.group = 'insert';
    ToDoListCircleTool.static.icon = 'ellipsis'; // Choose a suitable icon. 'circle' or 'radio' might be good if available. 'ellipsis' looks like a circle.
    ToDoListCircleTool.static.title = 'Checkcircle'; // Displayed in VE Insert menu
    ToDoListCircleTool.static.commandName = 'todocircle'; // This command inserts <todocircle>
    ve.ui.toolFactory.register( ToDoListCircleTool );

}() );
