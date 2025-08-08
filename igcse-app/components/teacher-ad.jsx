import { Button } from "@/components/ui/button";

export function TeacherAd({ teacher }) {
  if (!teacher) return null;
  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="flex items-center gap-4">
        {teacher.image_url ? <img src={teacher.image_url} alt={teacher.name} className="w-16 h-16 rounded-md object-cover"/> : null}
        <div className="flex-1">
          <div className="text-sm text-muted-foreground">Need help in {teacher.subject_name}?</div>
          <div className="font-semibold">Book a session with {teacher.name}</div>
          <div className="text-sm text-muted-foreground line-clamp-2">{teacher.bio}</div>
        </div>
        <Button asChild><a href={teacher.booking_url} target="_blank" rel="noreferrer">Book now</a></Button>
      </div>
    </div>
  );
}