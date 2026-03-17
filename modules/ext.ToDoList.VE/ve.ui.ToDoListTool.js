(function () {
    // Defensive check: Ensure VisualEditor and its core components are available
    // If not, log an error and stop execution to prevent further JS errors.
    if (typeof ve === 'undefined' || typeof ve.ui === 'undefined' || typeof OO === 'undefined' || typeof OO.inheritClass === 'undefined') {
        console.error('ToDoList VE tool: Required VisualEditor or OOJS libraries are missing.');
        return;
    }
    if (typeof ve.ui.MWTransclusionDialogTool === 'undefined') {
        console.error('ToDoList VE tool: Missing parent class ve.ui.MWTransclusionDialogTool. VisualEditor Transclusion module might not be loaded.');
        return;
    }

    // --- ORIGINAL ToDoListTemplateTool definition and inheritance (MOVED INSIDE WRAPPER) ---
    /**
     * Tool is used to insert a ToDoList template.
     *
     * @class
     * @extends ve.ui.MWTransclusionDialogTool
     *
     * @constructor
     * @param {OO.ui.ToolGroup} toolGroup
     * @param {Object} [config] Configuration options
     */
    ve.ui.ToDoListTemplateTool = function VeUiToDoListTemplateTool() {
        // Parent constructor
        ve.ui.ToDoListTemplateTool.super.apply(this, arguments);
    };
    OO.inheritClass(ve.ui.ToDoListTemplateTool, ve.ui.MWTransclusionDialogTool); // Now safely inside the wrapper

    /**
     * Command and Tool for inserting a <todo/> (Checkbox)
     */

    // Define the structure for inserting <todo/>
    var checkboxElem = [{
        type: 'mwTransclusionInline',
        attributes: {
            mw: {
                parts: [
                    '<todo/>'
                ]
            }
        }
    }, {
        type: '/mwTransclusionInline'
    }];

    // Register the command 'addcheckbox' for inserting <todo/>
    ve.ui.commandRegistry.register(
        new ve.ui.Command('addcheckbox', 'content', 'insert', {
            args: [checkboxElem, true, true],
            supportedSelections: ['linear']
        })
    );
    // VE source editor command (if active)
    if (ve.ui.wikitextCommandRegistry) {
        ve.ui.wikitextCommandRegistry.register(
            new ve.ui.Command('addcheckbox', 'mwWikitext', 'wrapSelection', {
                args: ['<todo/>'], // This will insert the raw wikitext tag
                supportedSelections: ['linear']
            })
        );
    }

    // Static Properties for the <todo/> tool
    ve.ui.ToDoListTemplateTool.static.name = 'todolist'; // Unique internal name
    ve.ui.ToDoListTemplateTool.static.group = 'insert'; // Group with other insert tools
    ve.ui.ToDoListTemplateTool.static.title = mw.msg('ve-todolist-toolbar-button'); // Localized title
    ve.ui.ToDoListTemplateTool.static.icon = 'check'; // Icon for the button
    ve.ui.ToDoListTemplateTool.static.commandName = 'addcheckbox'; // Command this tool executes

    // Register the <todo/> tool
    ve.ui.toolFactory.register(ve.ui.ToDoListTemplateTool);


    /**
     * Command and Tool for inserting a <todocircle/> (Checkcircle)
     */

    // Define the structure for inserting <todocircle/>
    var checkcircleElem = [{
        type: 'mwTransclusionInline',
        attributes: {
            mw: {
                parts: [
                    '<todocircle/>'
                ]
            }
        }
    }, {
        type: '/mwTransclusionInline'
    }];

    // Register the command 'addtodocircle' for inserting <todocircle/>
    ve.ui.commandRegistry.register(
        new ve.ui.Command('addtodocircle', 'content', 'insert', {
            args: [checkcircleElem, true, true],
            supportedSelections: ['linear']
        })
    );
    // VE source editor command (if active)
    if (ve.ui.wikitextCommandRegistry) {
        ve.ui.wikitextCommandRegistry.register(
            new ve.ui.Command('addtodocircle', 'mwWikitext', 'wrapSelection', {
                args: ['<todocircle/>'], // This will insert the raw wikitext tag
                supportedSelections: ['linear']
            })
        );
    }

    /**
     * Tool for inserting <todocircle/> into VisualEditor
     * @class
     * @extends ve.ui.MWTransclusionDialogTool
     */
    ve.ui.ToDoListCircleTemplateTool = function VeUiToDoListCircleTemplateTool() {
        // Parent constructor
        ve.ui.ToDoListCircleTemplateTool.super.apply(this, arguments);
    };
    OO.inheritClass(ve.ui.ToDoListCircleTemplateTool, ve.ui.MWTransclusionDialogTool);

    // Static Properties for the <todocircle/> tool
    ve.ui.ToDoListCircleTemplateTool.static.name = 'todolist-circle'; // Unique internal name
    ve.ui.ToDoListCircleTemplateTool.static.group = 'insert'; // Group with other insert tools
    ve.ui.ToDoListCircleTemplateTool.static.title = 'Checkcircle'; // Displayed in VE Insert menu
    ve.ui.ToDoListCircleTemplateTool.static.icon = 'ellipsis'; // Icon for the button
    ve.ui.ToDoListCircleTemplateTool.static.commandName = 'addtodocircle'; // Command this tool executes

    // Register the <todocircle/> tool
    ve.ui.toolFactory.register(ve.ui.ToDoListCircleTemplateTool);

})();
