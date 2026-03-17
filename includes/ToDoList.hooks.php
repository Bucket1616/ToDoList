<?php

use MediaWiki\Parser\Parser;
use MediaWiki\Output\OutputPage;

/**
 * Hooks used by ToDoList extension 
 */
class ToDoListHooks
{

	/**
	 * We extend parser here.
	 * Parser will process our custom tag: <todo>
	 */
	public static function onParserSetup(Parser $parser)
	{
		$parser->setHook('todo', 'ToDoListHooks::processToDoListTag');
		$parser->setHook('todocircle', 'ToDoListHooks::processToDoListTagCircle');
		return true;
	}

	Handler for square <todo>
	public static function processToDoListTag($input, array $args, Parser $parser, PPFrame $frame)
	{
		return self::renderInternal($args, $parser, 'todo');
	}

	Handler for circle <todocircle>
	public static function processToDoListTagCircle($input, array $args, Parser $parser, PPFrame $frame)
	{
		return self::renderCheckBoxWidget($args, $parser, 'todocirclce');
	}

	 /**
	 * Implementation of the '<todo>' tag processing
	 */
	public static function renderCheckBoxWidget(array $args, Parser $parser, $tagName)
    {
        $out = $parser->getOutput();
        OutputPage::setupOOUI(); // Ensure OOUI is set up
        $out->setEnableOOUI(true);
        $out->addModules(['ext.ToDoList']); // Load our JS/CSS

        $isDone = false;
        if (isset($args['done'])) {
            $isDone = filter_var($args['done'], FILTER_VALIDATE_BOOLEAN);
        }

        // Determine specific classes for styling and JS identification
        $extraClasses = ['todo-checkbox']; // Generic class for JS
        if ($tagName === 'todocirle') {
            $extraClasses[] = 'todo-type-circle'; // Specific class for circle style
        } else {
            $extraClasses[] = 'todo-type-square'; // Specific class for square style
        }

        $checkboxControl = new OOUI\CheckboxInputWidget([
            'selected' => $isDone,
            'classes' => $extraClasses,
            'id' => 'todo-' . md5(uniqid(rand(), true)) // Add a unique ID to the checkbox for robust JS interaction
        ]);

        return [$checkboxControl->toString(), 'markerType' => 'nowiki'];
    }
}
