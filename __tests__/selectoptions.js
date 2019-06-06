import React from "react";
import { render, cleanup, fireEvent } from "@testing-library/react";
import "jest-dom/extend-expect";
import userEvent from "../src";

afterEach(cleanup);

describe("userEvent.selectOptions", () => {
  it.each(["select", "select multiple"])(
    "should fire the correct events for <%s>",
    type => {
      const events = [];
      const eventsHandler = jest.fn(evt => events.push(evt.type));
      const multiple = type === "select multiple";
      const eventHandlers = {
        onMouseOver: eventsHandler,
        onMouseMove: eventsHandler,
        onMouseDown: eventsHandler,
        onFocus: eventsHandler,
        onMouseUp: eventsHandler,
        onClick: eventsHandler
      };

      const { getByTestId } = render(
        <select {...{ ...eventHandlers, multiple }} data-testid="element">
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
        </select>
      );

      userEvent.selectOptions(
        getByTestId("element"),
        option => option.value === "1"
      );

      expect(events).toEqual([
        "mouseover",
        "mousemove",
        "mousedown",
        "focus",
        "mouseup",
        "click",
        "mouseover", // The events repeat because we click on the child OPTION too
        "mousemove", // But these specifically are the events bubbling up to the <select>
        "mousedown",
        "focus",
        "mouseup",
        "click"
      ]);
    }
  );

  it("should fire the correct events on selected OPTION child with <select>", () => {
    function handleEvent(evt) {
      const optValue = parseInt(evt.target.value);
      events[optValue] = [...(events[optValue] || []), evt.type];
    }

    const events = [];
    const eventsHandler = jest.fn(handleEvent);
    const eventHandlers = {
      onMouseOver: eventsHandler,
      onMouseMove: eventsHandler,
      onMouseDown: eventsHandler,
      onFocus: eventsHandler,
      onMouseUp: eventsHandler,
      onClick: eventsHandler
    };

    const { getByTestId } = render(
      <select data-testid="element">
        <option {...eventHandlers} value="1">
          1
        </option>
        <option {...eventHandlers} value="2">
          2
        </option>
        <option {...eventHandlers} value="3">
          3
        </option>
      </select>
    );

    userEvent.selectOptions(
      getByTestId("element"),
      option => option.value === "2"
    );

    expect(events[1]).toBe(undefined);
    expect(events[3]).toBe(undefined);
    expect(events[2]).toEqual([
      "mouseover",
      "mousemove",
      "mousedown",
      "focus",
      "mouseup",
      "click"
    ]);
  });

  it("should fire the correct events on selected OPTION children with <select multiple>", () => {
    function handleEvent(evt) {
      const optValue = parseInt(evt.target.value);
      events[optValue] = [...(events[optValue] || []), evt.type];
    }

    const events = [];
    const eventsHandler = jest.fn(handleEvent);
    const eventHandlers = {
      onMouseOver: eventsHandler,
      onMouseMove: eventsHandler,
      onMouseDown: eventsHandler,
      onFocus: eventsHandler,
      onMouseUp: eventsHandler,
      onClick: eventsHandler
    };

    const { getByTestId } = render(
      <select multiple data-testid="element">
        <option {...eventHandlers} value="1">
          1
        </option>
        <option {...eventHandlers} value="2">
          2
        </option>
        <option {...eventHandlers} value="3">
          3
        </option>
      </select>
    );

    userEvent.selectOptions(
      getByTestId("element"),
      option => option.value === "1" || option.value === "3"
    );

    expect(events[2]).toBe(undefined);
    expect(events[1]).toEqual([
      "mouseover",
      "mousemove",
      "mousedown",
      "focus",
      "mouseup",
      "click"
    ]);

    expect(events[3]).toEqual([
      "mouseover",
      "mousemove",
      "mousedown",
      "focus",
      "mouseup",
      "click"
    ]);
  });

  it("sets the selected prop on the selected OPTION", () => {
    const onSubmit = jest.fn();

    const { getByTestId } = render(
      <form onSubmit={onSubmit}>
        <select multiple data-testid="element">
          <option data-testid="val1" value="1">
            1
          </option>
          <option data-testid="val2" value="2">
            2
          </option>
          <option data-testid="val3" value="3">
            3
          </option>
        </select>
        <input type="submit" data-testid="submit" value="Submit" />
      </form>
    );

    userEvent.selectOptions(
      getByTestId("element"),
      option => option.value === "1" || option.value === "3"
    );

    fireEvent.click(getByTestId("submit"));

    expect(onSubmit.mock.calls.length).toBe(1);
    expect(getByTestId("val1").selected).toBe(true);
    expect(getByTestId("val2").selected).toBe(false);
    expect(getByTestId("val3").selected).toBe(true);
  });
});
