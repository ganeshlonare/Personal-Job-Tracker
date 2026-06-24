"use server";

import * as cheerio from "cheerio";

export async function getTodaysGithubCommits(username: string): Promise<number> {
  try {
    const res = await fetch(`https://github.com/users/${username}/contributions`, {
      next: { revalidate: 0 },
      cache: "no-store",
    });
    
    if (!res.ok) {
      return 0;
    }
    
    const html = await res.text();
    const $ = cheerio.load(html);
    
    const today = new Date();
    // GitHub uses YYYY-MM-DD in local browser timezone, but server is UTC.
    // However, GitHub's contribution graph renders dates based on the user's timezone or UTC?
    // We can just check the last element in the table.
    
    const days = $("td.ContributionCalendar-day");
    if (days.length === 0) return 0;
    
    // The very last <td> element is today or the most recent day shown on the graph
    const lastDay = days.last();
    const tooltipId = lastDay.attr("id");
    
    if (!tooltipId) return 0;
    
    const tooltipText = $(`tool-tip[for="${tooltipId}"]`).text().trim();
    // tooltipText looks like "5 contributions on June 23th" or "No contributions on June 23th"
    
    const countMatch = tooltipText.match(/^(\d+|No)\s+contribution/i);
    if (countMatch) {
      if (countMatch[1].toLowerCase() === "no") {
        return 0;
      }
      return parseInt(countMatch[1]);
    }
    
    return 0;
  } catch (error) {
    console.error("Failed to fetch Github contributions HTML", error);
    return 0;
  }
}
