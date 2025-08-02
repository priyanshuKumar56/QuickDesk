"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import { setFilters } from "@/lib/features/tickets/ticketSlice"
import { TicketQueueList } from "./ticket-queue-list"

export function TicketQueueTabs() {
  const dispatch = useAppDispatch()
  const { tickets, filters } = useAppSelector((state) => state.tickets)
  const { user } = useAppSelector((state) => state.auth)

  const handleQueueChange = (queue: "my-tickets" | "all-tickets" | "unassigned") => {
    dispatch(setFilters({ queue }))
  }

  const getTicketCounts = () => {
    const myTickets = tickets.filter((t) => t.assignedTo === user?.id)
    const unassignedTickets = tickets.filter((t) => !t.assignedTo)

    return {
      myTickets: myTickets.length,
      allTickets: tickets.length,
      unassigned: unassignedTickets.length,
    }
  }

  const counts = getTicketCounts()

  // Don't show for regular users
  if (user?.role === "user") {
    return null
  }

  return (
    <Tabs value={filters.queue} onValueChange={handleQueueChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-gray-100">
        <TabsTrigger
          value="my-tickets"
          className="data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2"
        >
          My Tickets
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
            {counts.myTickets}
          </Badge>
        </TabsTrigger>
        <TabsTrigger
          value="all-tickets"
          className="data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2"
        >
          All Tickets
          <Badge variant="secondary" className="bg-gray-100 text-gray-800 text-xs">
            {counts.allTickets}
          </Badge>
        </TabsTrigger>
        <TabsTrigger
          value="unassigned"
          className="data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2"
        >
          Unassigned
          <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
            {counts.unassigned}
          </Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="my-tickets" className="mt-6">
        <TicketQueueList queueType="my-tickets" />
      </TabsContent>

      <TabsContent value="all-tickets" className="mt-6">
        <TicketQueueList queueType="all-tickets" />
      </TabsContent>

      <TabsContent value="unassigned" className="mt-6">
        <TicketQueueList queueType="unassigned" />
      </TabsContent>
    </Tabs>
  )
}
