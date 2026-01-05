from typing import List, Dict, Optional, Any
from collections import defaultdict

class TimetableCSP:
    def __init__(self, selected_subjects: List[str], courses_data: List[Dict], leave_day: str, preferred_faculties: Dict[str, str]):
        self.selected_subjects = selected_subjects
        self.courses_data = courses_data
        self.leave_day = leave_day
        self.preferred_faculties = preferred_faculties
        
        # Organize domains: Subject -> List of valid slots
        self.domains = self._build_domains()
        self.assignment = {}  # Subject -> Slot
        self.conflicts = []

    def _build_domains(self):
        domains = defaultdict(list)
        for course in self.courses_data:
            if course['course_name'] in self.selected_subjects:
                # Filter hard constraints immediately (Leave Day)
                if course['day'] == self.leave_day:
                    continue
                
                domains[course['course_name']].append(course)
        
        # Sort domains based on preferences (Soft Constraint)
        for subject in domains:
            preferred = self.preferred_faculties.get(subject)
            if preferred:
                domains[subject].sort(key=lambda x: 0 if x['faculty'] == preferred else 1)
                
        return domains

    def solve(self):
        # Validation checks
        for subject in self.selected_subjects:
            if subject not in self.domains or not self.domains[subject]:
                return {"status": "failure", "reason": f"No valid slots for {subject} (possibly due to leave day constraint)"}

        if self._backtrack():
            return {"status": "success", "timetable": self._format_assignment()}
        else:
            return {"status": "conflict", "reason": "Unable to find a clash-free schedule"}

    def _backtrack(self):
        if len(self.assignment) == len(self.selected_subjects):
            return True

        # Select unassigned variable (Order varies, let's pick first unassigned)
        var = next(sub for sub in self.selected_subjects if sub not in self.assignment)

        for value in self.domains[var]:
            if self._is_consistent(var, value):
                self.assignment[var] = value
                if self._backtrack():
                    return True
                del self.assignment[var]
        
        return False

    def _is_consistent(self, var, value):
        # Check against current assignment
        for assigned_var, assigned_val in self.assignment.items():
            # time overlap check
            if assigned_val['day'] == value['day']:
                # Overlap logic: (StartA < EndB) and (StartB < EndA)
                # Convert time strings to comparable minutes or just compare strings if format is HH:MM
                if self._check_overlap(assigned_val['start_time'], assigned_val['end_time'],
                                       value['start_time'], value['end_time']):
                    return False
            
            # Additional constraint: A faculty cannot teach two classes at the same time
            # (Implicitly handled if we assume faculty is part of the 'value', but good to be explicit if subjects differ)
            if assigned_val['faculty'] == value['faculty']:
                 if assigned_val['day'] == value['day']:
                    if self._check_overlap(assigned_val['start_time'], assigned_val['end_time'],
                                           value['start_time'], value['end_time']):
                        return False
                        
        return True

    def _check_overlap(self, start1, end1, start2, end2):
        # HH:MM format comparison
        return (start1 < end2) and (start2 < end1)

    def _format_assignment(self):
        output = []
        for subject, slot in self.assignment.items():
            output.append({
                "Subject": subject,
                "Faculty": slot['faculty'],
                "Day": slot['day'],
                "Time": f"{slot['start_time']} - {slot['end_time']}",
                "Slot": slot['slot']
            })
        return output

    def get_suggestions(self):
        # Simple heuristic: what if we ignore the leave day?
        # Or what if we ignore preferences?
        # For now, just return a basic message.
        return "Try changing your leave day or removing a subject."
