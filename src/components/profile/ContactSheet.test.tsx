// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { demoProfile } from "@/lib/fixtures";
import { ContactSheet } from "./ContactSheet";

const slot = {
  weekday: 2,
  start: "18:00",
  iso: "2026-09-22T23:00:00.000Z",
  label: "Tuesday, September 22 at 6:00 PM (America/Chicago)",
  shortLabel: "Tue, Sep 22, 6:00 PM",
};

afterEach(cleanup);

describe("ContactSheet", () => {
  it("retains entry-point selections in the outbound email", () => {
    render(<ContactSheet profile={demoProfile} slots={[slot]} open onClose={() => {}} initialService="coaching" initialSlot={slot.iso} />);
    expect((screen.getByRole("radio", { name: "Private coaching" }) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByLabelText(/Preferred time/) as HTMLSelectElement).value).toBe(slot.iso);
    fireEvent.change(screen.getByLabelText(/Additional message/), { target: { value: "League preparation" } });
    const email = screen.getByRole("link", { name: /Continue with Email/ });
    expect(email.getAttribute("href")).toContain("private%20coaching%20on%20Tuesday");
    expect(email.getAttribute("href")).toContain("League%20preparation");
  });

  it("closes with Escape", () => {
    const onClose = vi.fn();
    render(<ContactSheet profile={demoProfile} slots={[]} open onClose={onClose} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
