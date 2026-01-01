import type { ComponentProps, HTMLAttributes, ReactNode } from "react";
import type { DeliverableStatus, TaskStatus, PhaseType } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { formatTitleCase } from "@/lib/helpers";

type StatusType = DeliverableStatus | TaskStatus | PhaseType;

export type StatusBadgeProps = ComponentProps<typeof Badge> & {
	status: StatusType;
};

const getStatusVariant = (status: StatusType): VariantProps<typeof Badge>["variant"] => {
	switch (status) {
		case "COMPLETED":
		case "DONE":
			return "success";
		case "BLOCKED":
			return "error";
		case "IN_PROGRESS":
			return "info";
		case "REVIEW":
			return "warning";
		case "TODO":
		case "NOT_STARTED":
			return "ghost";
		case "WATERFALL":
			return "waterfall";
		case "SCRUM":
			return "scrum";
		case "FALL":
			return "fall";
		default:
			return "info";
	}
};

export const StatusBadge = ({ className, status, ...props }: StatusBadgeProps) => (
	<Badge
		className={cn("", className)}
		variant={getStatusVariant(status)}
		{...props}
	>
		<StatusIndicator status={status} />
		<StatusLabel>{formatTitleCase(status)}</StatusLabel>
	</Badge>
);

export type StatusIndicatorProps = {
	status?: StatusType;
	className?: string;
};

const getStatusIcon = (status?: StatusType): ReactNode => {
	const iconClassName = "size-3.5 shrink-0";

	switch (status) {
		case "COMPLETED":
		case "DONE":
			return (
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					className={iconClassName}
				>
					<path
						className="fill-lime-500 dark:fill-lime-600 stroke-lime-900 dark:stroke-lime-800"
						d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
						// fill="#0FCC18"
						// stroke="#015300"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M9 12L11 14L15 10"
						stroke="white"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			);
		case "BLOCKED":
			return (
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					data-brie-extend="true"
				>
					<path
						d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
						className="fill-red-500 dark:fill-red-600 stroke-red-900 dark:stroke-red-800"
						// fill="#FC4946"
						// stroke="#902829"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M15 9L9 15"
						stroke="white"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M9 9L15 15"
						stroke="white"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			);
		case "REVIEW":
			return (
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					data-brie-extend="true"
					className="[&>path:not(:first-child)]:stroke-warning-foreground"
				>
					<path
						d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
						className="fill-amber-300 dark:fill-amber-800"
						// fill="#D5D8E1"
					/>
					<path
						d="M10.1001 2.18005C11.355 1.93543 12.6452 1.93543 13.9001 2.18005"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M17.6001 3.70996C18.6624 4.42822 19.5758 5.34503 20.2901 6.40996"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M21.8198 10.1C22.0644 11.3548 22.0644 12.6451 21.8198 13.9"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M20.2898 17.6C19.5716 18.6622 18.6548 19.5757 17.5898 20.29"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M13.9001 21.8199C12.6452 22.0643 11.355 22.0643 10.1001 21.8199"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M6.39996 20.29C5.33769 19.5717 4.42427 18.6549 3.70996 17.59"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M2.18005 13.9C1.93543 12.6451 1.93543 11.3548 2.18005 10.1"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M3.70996 6.39996C4.42822 5.33769 5.34503 4.42427 6.40996 3.70996"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			);
		case "IN_PROGRESS":
			return (
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					data-brie-extend="true"
					className="[&>path:not(:first-child)]:stroke-info-foreground"
				>
					<path
						d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
						className="fill-blue-300 dark:fill-blue-800"
					/>
					<path
						d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			);
		case "TODO":
		case "NOT_STARTED":
			return (
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					data-brie-extend="true"
					className="[&>path:not(:first-child)]:stroke-muted-foreground"
				>
					<path
						d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
						className="fill-neutral-300 dark:fill-neutral-800"
					/>
					<path
						d="M10.1001 2.18204C11.3551 1.93916 12.6451 1.93916 13.9001 2.18204"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M13.9001 21.818C12.6451 22.0609 11.3551 22.0609 10.1001 21.818"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M17.6089 3.72095C18.6704 4.44017 19.5836 5.35682 20.2989 6.42095"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M2.18216 13.9C1.93928 12.645 1.93928 11.355 2.18216 10.1"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M20.2791 17.609C19.5599 18.6705 18.6432 19.5837 17.5791 20.299"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M21.8179 10.1C22.0607 11.355 22.0607 12.645 21.8179 13.9"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M3.72119 6.39105C4.44041 5.32958 5.35706 4.41633 6.42119 3.70105"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M6.39117 20.279C5.3297 19.5598 4.41645 18.6431 3.70117 17.579"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			);
		case "WATERFALL":
			return (
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					data-brie-extend="true"
				>
					<path
						d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
						className="fill-cyan-500 dark:fill-cyan-600 stroke-cyan-900 dark:stroke-cyan-800"
						// fill="#70D4EC"
						// stroke="#2798A6"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M12 8V16"
						stroke="white"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M8 12L12 16L16 12"
						stroke="white"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			);
		case "SCRUM":
			return (
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					data-brie-extend="true"
					className="[&>path:not(:first-child)]:stroke-indigo-900 dark:[&>path:not(:first-child)]:stroke-indigo-400"
				>
					<path
						d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
						className="fill-indigo-300 dark:fill-indigo-800"
						// fill="#5CA5FC"
					/>
					<path
						d="M21 12C21 9.61305 20.0518 7.32387 18.364 5.63604C16.6761 3.94821 14.3869 3 12 3C9.48395 3.00947 7.06897 3.99122 5.26 5.74L3 8"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M3 3V8H8"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M3 12C3 14.3869 3.94821 16.6761 5.63604 18.364C7.32387 20.0518 9.61305 21 12 21C14.516 20.9905 16.931 20.0088 18.74 18.26L21 16"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M16 16H21V21"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			);
		case "FALL":
			return (
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					data-brie-extend="true"
				>
					<path
						d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
						className="fill-orange-500 dark:fill-orange-600 stroke-orange-900 dark:stroke-orange-800"
						// fill="#FFBA5F"
						// stroke="#9B6930"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M8 12H16"
						stroke="white"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			);
		default:
			return (
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					data-brie-extend="true"
				>
					<path
						d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
						className="fill-blue-500 dark:fill-blue-600 stroke-blue-900 dark:stroke-blue-800"
						// fill="#5FACFF"
						// stroke="#305E9B"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M12 16V12"
						stroke="white"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M12 8H12.01"
						stroke="white"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			);
	}
};

export const StatusIndicator = ({
	// className,
	status,
}: StatusIndicatorProps) => {
	return <>{getStatusIcon(status)}</>;
};

export type StatusLabelProps = HTMLAttributes<HTMLSpanElement> & {
	children?: React.ReactNode;
};

export const StatusLabel = ({ className, children, ...props }: StatusLabelProps) => (
	<span
		className={cn("text-xs font-medium", className)}
		{...props}
	>
		{children}
	</span>
);
