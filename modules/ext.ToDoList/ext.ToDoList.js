// Renamed for clarity: handles updating the Nth <todo> tag
function changeNthTodoState(content, index, desiredStatus) {
    let counter = 0;
    return content.replace(/<todo(?:\s+done="(true|false)")?\s*\/>/g, function (match) {
        counter++;
        if (counter === index) {
            return desiredStatus ? '<todo done="true"/>' : '<todo/>';
        }
        return match;
    });
}

// New function: handles updating the Nth <todocircle> tag
function changeNthTodocircleState(content, index, desiredStatus) {
    let counter = 0;
    return content.replace(/<todocircle(?:\s+done="(true|false)")?\s*\/>/g, function (match) {
        counter++;
        if (counter === index) {
            return desiredStatus ? '<todocircle done="true"/>' : '<todocircle/>';
        }
        return match;
    });
}

// Queue is needed to avoid at least "local" edit conflicts. All edits are sequential, not parallel
var toDoModificationQueue = Promise.resolve();

(function (mw, $) {
    let todoIndexCounter = 0; // Counter for <todo> tags
    let todocircleIndexCounter = 0; // Counter for <todocircle> tags

    // Loop through all OOUI checkbox widgets rendered by our PHP hook
    // The outerElement is the .oo-ui-checkboxInputWidget container
    $(".oo-ui-checkboxInputWidget").each(function (outerIndex, outerElement) {
        // Find the actual checkbox input inside the OOUI widget container
        // This input will have the 'todo-checkbox' class we added in PHP
        const $input = $(outerElement).find('.todo-checkbox');
        if ($input.length === 0) {
            return; // Not one of our checkboxes, skip
        }

        const element = $input[0]; // Get the native DOM input element for event listener
        const $ooUiWidget = $(outerElement); // The main OOUI widget container for class checks

        // Determine the tag type based on the class added in PHP
        let tagNameType;
        if ($ooUiWidget.hasClass('todo-type-circle')) {
            tagNameType = 'todocircle';
            todocircleIndexCounter++;
            element.todoSpecificIndex = todocircleIndexCounter; // Store index specific to todocircle
        } else { // Assume it's a square todo
            tagNameType = 'todo';
            todoIndexCounter++;
            element.todoSpecificIndex = todoIndexCounter; // Store index specific to todo
        }
        element.tagNameType = tagNameType; // Store the tag type on the element


        // Attach event listener to the OOUI checkbox input's 'change' event
        element.addEventListener('change', function (e) {
            document.body.style.cursor = "wait";

            toDoModificationQueue = toDoModificationQueue.then(new mw.Api().edit(
                mw.config.get('wgTitle'),
                function (revision) {
                    var checkedState = element.checked; // Get current checked state from the input
                    var currentTodoIndex = element.todoSpecificIndex; // Get the specific index for its type
                    var currentTagNameType = element.tagNameType; // Get the specific tag type

                    var newText;
                    if (currentTagNameType === 'todocircle') {
                        newText = changeNthTodocircleState(revision.content, currentTodoIndex, checkedState);
                    } else { // 'todo'
                        newText = changeNthTodoState(revision.content, currentTodoIndex, checkedState);
                    }
                    
                    return {
                        text: newText,
                        summary: 'Checkbox click (set ' + currentTagNameType + ' #' + currentTodoIndex + ' to ' + (checkedState ? 'checked' : 'unchecked') + ')',
                        minor: true
                    };
                }
            )
            .then(function () {
                document.body.style.cursor = "";
                // OOUI widget handles its own visual state update, so no manual refresh needed.
            })
            .catch(function (error) {
                document.body.style.cursor = "";
                mw.log.error('ToDoList: Error saving checkbox state:', error);
                // Revert checkbox state visually if API call fails
                element.checked = !checkedState; 
                // Display an alert for the user
                alert('Failed to save checkbox state. Please try again. Error: ' + (error.error && error.error.info ? error.error.info : JSON.stringify(error)));
            }));
        });
    });
}(mediaWiki, jQuery));
