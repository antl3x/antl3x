import React from "react";
import { format, formatDistanceToNow } from "date-fns"; // Import format function from date-fns

/**
 * TODO: use Plausible.io views instead of the mock
 */
export default function Info(props) {
    // Destructure the props
    const { date, views } = props;

    // Format the date to a more friendly format, e.g., Jan 30, 2024
    const friendlyDate = format(new Date(date), "MMM do, yyyy");
    const relativeDate = formatDistanceToNow(new Date(date), { addSuffix: true  });

    return (
        <div className="text-sm flex-wrap flex w-full justify-between opacity-50">
            <div className="flex flex-wrap justify-between md:space-x-2">
                <div className="hidden">|</div>
                <div>{friendlyDate} ({relativeDate})</div>
            </div>
            <div>
                <span>{views} views</span>
            </div>
        </div>
    );
}
