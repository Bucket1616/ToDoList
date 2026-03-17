<?php

use MediaWiki\Parser\Parser;

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
		return self::renderInternal($args, $parser, 'todo2');
	}

	 /**
	 * Implementation of the '<todo>' tag processing
	 */
	public static function renderInternal(array $args, Parser $parser, $tagName)
	{
		$out = $parser->getOutput();
		OutputPage::setupOOUI();
		$out->setEnableOOUI(true);
		$out->addModules(['ext.ToDoList']);

		$isDone = False;
		if (isset($args['done'])) {
			$isDone =  filter_var($args['done'], FILTER_VALIDATE_BOOLEAN);
		}

		// Determine specific classes
		$extraClass = ($tagName === 'todo2') ? 'todo-circle' : 'todo-square';

		// We add the 'todo-checkbox' class for the JS to find it,
		// and 'todo-circle'/'todo-square' for styling and logic.
		$checkboxControl = new OOUI\CheckboxInputWidget([
			'selected' => $isDone,
			'classes' => ['todo-checkbox', $extraClass]
		]);

		// Return the widget
		return [$checkboxControl->toString(), 'markerType' => 'nowiki'];
	}
}
