// Function to update the state of a specific checkbox identified by its OOUI ID and tag type
function updateCheckboxStateById(content, checkboxId, desiredStatus, tagName) {
    let tagRegex;
    if (tagName === 'todo') {
        tagRegex = /<todo(?:\s+done="(true|false)")?\s*\/>/g;
    } else if (tagName === 'todo2') {
        tagRegex = /<todo2(?:\s+done="(true|false)")?\s*\/>/g;
    } else {
        // Should not happen if tagName is properly passed
        return content;
    }

    // Since we're parsing by index, we need to iterate and count.
    // This is still fragile if other users edit the page concurrently and change the order.
    // A more robust solution would embed the actual ID in the wikitext, 
    // but that would require changing the PHP parser's output more significantly.
    // For now, we will rely on the existing counting method but differentiate by tag type.

    // This part is the most delicate due to the original counting approach.
    // The current code counts ALL <todo> tags regardless of their OOUI widget ID.
    // To make it truly ID-based, the PHP would need to output something like
    // <todo id="uniqueWikiId"/> and the JS would search for that specific ID.
    // Given the current structure, we'll keep the Nth counting but make sure we
    // only count tags of the *specific type* (todo or todo2).

    // Let's simplify this. We assume the current `content.replace` is sufficient,
    // but we need to select the correct `changeNth...` based on `tagName`.

    // The original JS has `changeNthCheckboxState`. We will generalize it:
    let counter = 0;
    let targetIndex = -1; // We can't know the exact index without parsing HTML/Wikitext upfront

    // We must pass the correct index for the TAG TYPE from the element itself
    // Let's modify the `each` loop to find the index *for its type*
    return content.replace(tagRegex, function(match) {
        counter++;
        if (counter === targetIndex) { // targetIndex must be passed from the click handler
            return desiredStatus ? '<' + tagName + ' done="true"/>' : '<' + tagName + '/>';
        }
        return match;
    });
}


// Okay, the original logic in ext.todolist.js is extremely simplified and relies on
// `changeNthCheckboxState` counting *all* `<todo>` tags.
// To handle `<todo2>` while maintaining this counting, we need separate counters for each type.

// Rename original function for clarity
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

// New function for <todo2> tags
function changeNthTodo2State(content, index, desiredStatus) {
	let counter = 0;
	return content.replace(/<todo2(?:\s+done="(true|false)")?\s*\/>/g, function (match) {
		counter++;
		if (counter === index) {
			return desiredStatus ? '<todo2 done="true"/>' : '<todo2/>';
		}
		return match;
	});
}

// Queue is needed to avoid at least "local" edit conflicts. All edits are sequential, not parallel
var toDoModificationQueue = Promise.resolve();

(function (mw, $) {
	let todoIndexCounter = 0; // Counter for <todo> tags
	let todo2IndexCounter = 0; // Counter for <todo2> tags

	// Loop through all elements that are styled as checkboxes by OOUI,
	// because the OOUI widget replaces our original span.
	$(".oo-ui-checkboxInputWidget").each(function (outerIndex, outerElement) {
		// Find the actual checkbox input inside the widget
		const $input = $(outerElement).find('.todo-checkbox');
		if ($input.length === 0) {
			return; // Not one of our checkboxes
		}

		const element = $input[0]; // Get the native DOM element for event listener
		const $ooUiWidget = $(outerElement); // The main OOUI widget container

		// Determine the tag type (todo or todo2) based on the class added in PHP
		let tagNameType;
		if ($ooUiWidget.hasClass('todo-type-circle')) {
			tagNameType = 'todo2';
			todo2IndexCounter++;
			element.todoSpecificIndex = todo2IndexCounter; // Store index specific to todo2
		} else { // Assume it's a square todo
			tagNameType = 'todo';
			todoIndexCounter++;
			element.todoSpecificIndex = todoIndexCounter; // Store index specific to todo
		}
		element.tagNameType = tagNameType; // Store the tag type on the element


		// Here we process checkbox click in "read" mode. "Edit" mode will not have this functionality for now.
		element.addEventListener('change', function (e) { // Use 'change' event as OOUI input triggers it
			// Page modification takes some time. We will mark checkbox as checked after the process is finished. 
			document.body.style.cursor = "wait";

			toDoModificationQueue = toDoModificationQueue.then(new mw.Api().edit(
				mw.config.get('wgTitle'),
				function (revision) {
					var checkedState = element.checked; // directly use .checked from the input
					var currentTodoIndex = element.todoSpecificIndex; // Get the specific index
					var currentTagNameType = element.tagNameType; // Get the specific tag type

					var newText;
					if (currentTagNameType === 'todo2') {
						newText = changeNthTodo2State(revision.content, currentTodoIndex, checkedState);
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
				// Page edit is done, we can show it to user -- change state and cursor style
				document.body.style.cursor = "";
				// The OOUI widget updates its own visual state automatically
				// We don't need to manually refresh the page or element state
			})
			.catch(function (error) {
				document.body.style.cursor = "";
				mw.log.error('ToDoList: Error saving checkbox state:', error);
				// Optionally revert the checkbox visual state if the save failed
				element.checked = !checkedState; 
				alert('Failed to save checkbox state. Error: ' + error.error.info);
			}));
		});
	});
}(mediaWiki, jQuery));
