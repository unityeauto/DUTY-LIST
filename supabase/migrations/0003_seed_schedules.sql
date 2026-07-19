-- Migration: Seed all 49 duty schedules from the Excel sheet
-- All trips transcribed with schedule_number, return_code, start times, routes, and total kilometers
-- These are ordinary rows; Admin can edit/delete them via the UI

-- Insert duty schedules
INSERT INTO duty_schedules (schedule_number, return_code, total_km, is_active) VALUES
('92', 'ABD-5', 525.03, true),
('93', 'ABD-6', 525.03, true),
('94', 'ABD-7', 525.03, true),
('95', NULL, 350.02, true),
('98', NULL, 350.02, true),
('96', 'BVN-5', 525.03, true),
('97', 'BVN-6', 525.03, true),
('99', 'BVN-7', 525.03, true),
('UNNUMBERED', NULL, 350.02, true),  -- Row 9 has no schedule number
('111', NULL, 427.02, true),
('121', NULL, 427.02, true),
('120', NULL, 427.02, true),
('85', NULL, 427.02, true),
('79', NULL, 427.02, true),
('80', NULL, 427.02, true),
('81', NULL, 427.02, true),
('82', NULL, 427.02, true),
('83', NULL, 427.02, true),
('84', NULL, 427.02, true),
('77', NULL, 627.58, true),
('78', NULL, 407.40, true),
('114', NULL, 407.40, true),
('113', NULL, 407.40, true),
('76', NULL, 611.10, true),
('110', NULL, 407.40, true),
('100', NULL, 407.40, true),
('86/87-DAILY-ONE-WAY', NULL, 392.37, true),  -- Row 27: 86/87 daily-one-way variant
('86/87-DAILY-VICE-VERSA', NULL, 392.37, true),  -- Row 27: second variant
('106', NULL, 452.18, true),
('91', NULL, 579.38, true),
('101', NULL, 543.52, true),
('122', NULL, 676.90, true),
('73', NULL, 454.82, true),
('112', NULL, 454.82, true),
('123', NULL, 400.08, true),
('109', NULL, 400.08, true),
('88', NULL, 521.86, true),
('90', NULL, 663.12, true),
('119', NULL, 610.12, true),
('89', NULL, 610.12, true),
('107', NULL, 415.01, true),
('74', NULL, 415.01, true),
('108', NULL, 415.01, true),
('75', NULL, 415.01, true),
('115', NULL, 479.90, true),
('116', NULL, 479.90, true),
('117', NULL, 416.47, true),
('118', NULL, 416.47, true),
('124', NULL, 401.22, true),
('125', NULL, 401.22, true);

-- Insert schedule trips (ordered by schedule_number from Excel, trip_sequence by time)

-- Schedule 92
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '05:00'::time, 'Ahmedabad - Bhavnagar' FROM duty_schedules WHERE schedule_number = '92'
UNION ALL
SELECT id, 2, '10:00'::time, 'Bhavnagar - Ahmedabad' FROM duty_schedules WHERE schedule_number = '92'
UNION ALL
SELECT id, 3, '15:00'::time, 'Ahmedabad - Bhavnagar' FROM duty_schedules WHERE schedule_number = '92';

-- Schedule 93
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '06:00'::time, 'Ahmedabad - Bhavnagar' FROM duty_schedules WHERE schedule_number = '93'
UNION ALL
SELECT id, 2, '11:00'::time, 'Bhavnagar - Ahmedabad' FROM duty_schedules WHERE schedule_number = '93'
UNION ALL
SELECT id, 3, '16:00'::time, 'Ahmedabad - Bhavnagar' FROM duty_schedules WHERE schedule_number = '93';

-- Schedule 94
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '07:00'::time, 'Ahmedabad - Bhavnagar' FROM duty_schedules WHERE schedule_number = '94'
UNION ALL
SELECT id, 2, '12:00'::time, 'Bhavnagar - Ahmedabad' FROM duty_schedules WHERE schedule_number = '94'
UNION ALL
SELECT id, 3, '17:00'::time, 'Ahmedabad - Bhavnagar' FROM duty_schedules WHERE schedule_number = '94';

-- Schedule 95
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '08:00'::time, 'Ahmedabad - Bhavnagar' FROM duty_schedules WHERE schedule_number = '95'
UNION ALL
SELECT id, 2, '13:00'::time, 'Bhavnagar - Ahmedabad' FROM duty_schedules WHERE schedule_number = '95';

-- Schedule 98
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '13:00'::time, 'Ahmedabad - Bhavnagar' FROM duty_schedules WHERE schedule_number = '98'
UNION ALL
SELECT id, 2, '18:00'::time, 'Bhavnagar - Ahmedabad' FROM duty_schedules WHERE schedule_number = '98';

-- Schedule 96
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '05:00'::time, 'Bhavnagar - Ahmedabad' FROM duty_schedules WHERE schedule_number = '96'
UNION ALL
SELECT id, 2, '10:00'::time, 'Ahmedabad - Bhavnagar' FROM duty_schedules WHERE schedule_number = '96'
UNION ALL
SELECT id, 3, '15:00'::time, 'Bhavnagar - Ahmedabad' FROM duty_schedules WHERE schedule_number = '96';

-- Schedule 97
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '06:00'::time, 'Bhavnagar - Ahmedabad' FROM duty_schedules WHERE schedule_number = '97'
UNION ALL
SELECT id, 2, '11:00'::time, 'Ahmedabad - Bhavnagar' FROM duty_schedules WHERE schedule_number = '97'
UNION ALL
SELECT id, 3, '16:00'::time, 'Bhavnagar - Ahmedabad' FROM duty_schedules WHERE schedule_number = '97';

-- Schedule 99
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '07:00'::time, 'Bhavnagar - Ahmedabad' FROM duty_schedules WHERE schedule_number = '99'
UNION ALL
SELECT id, 2, '12:00'::time, 'Ahmedabad - Bhavnagar' FROM duty_schedules WHERE schedule_number = '99'
UNION ALL
SELECT id, 3, '17:00'::time, 'Bhavnagar - Ahmedabad' FROM duty_schedules WHERE schedule_number = '99';

-- UNNUMBERED (row 9)
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '08:00'::time, 'Bhavnagar - Ahmedabad' FROM duty_schedules WHERE schedule_number = 'UNNUMBERED'
UNION ALL
SELECT id, 2, '18:00'::time, 'Ahmedabad - Bhavnagar' FROM duty_schedules WHERE schedule_number = 'UNNUMBERED';

-- Schedule 111
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '05:00'::time, 'Ahmedabad - Dhanera' FROM duty_schedules WHERE schedule_number = '111'
UNION ALL
SELECT id, 2, '11:15'::time, 'Dhanera - Ahmedabad' FROM duty_schedules WHERE schedule_number = '111';

-- Schedule 121
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '10:00'::time, 'Ahmedabad - Dhanera' FROM duty_schedules WHERE schedule_number = '121'
UNION ALL
SELECT id, 2, '16:15'::time, 'Dhanera - Ahmedabad' FROM duty_schedules WHERE schedule_number = '121';

-- Schedule 120
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '11:00'::time, 'Ahmedabad - Dhanera' FROM duty_schedules WHERE schedule_number = '120'
UNION ALL
SELECT id, 2, '17:15'::time, 'Dhanera - Ahmedabad' FROM duty_schedules WHERE schedule_number = '120';

-- Schedule 85
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '12:00'::time, 'Ahmedabad - Dhanera' FROM duty_schedules WHERE schedule_number = '85'
UNION ALL
SELECT id, 2, '18:15'::time, 'Dhanera - Ahmedabad' FROM duty_schedules WHERE schedule_number = '85';

-- Schedule 79
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '05:00'::time, 'Dhanera - Ahmedabad' FROM duty_schedules WHERE schedule_number = '79'
UNION ALL
SELECT id, 2, '13:00'::time, 'Ahmedabad - Dhanera' FROM duty_schedules WHERE schedule_number = '79';

-- Schedule 80
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '06:00'::time, 'Dhanera - Ahmedabad' FROM duty_schedules WHERE schedule_number = '80'
UNION ALL
SELECT id, 2, '14:00'::time, 'Ahmedabad - Dhanera' FROM duty_schedules WHERE schedule_number = '80';

-- Schedule 81
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '07:00'::time, 'Dhanera - Ahmedabad' FROM duty_schedules WHERE schedule_number = '81'
UNION ALL
SELECT id, 2, '15:00'::time, 'Ahmedabad - Dhanera' FROM duty_schedules WHERE schedule_number = '81';

-- Schedule 82
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '08:00'::time, 'Dhanera - Ahmedabad' FROM duty_schedules WHERE schedule_number = '82'
UNION ALL
SELECT id, 2, '16:00'::time, 'Ahmedabad - Dhanera' FROM duty_schedules WHERE schedule_number = '82';

-- Schedule 83
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '09:00'::time, 'Dhanera - Ahmedabad' FROM duty_schedules WHERE schedule_number = '83'
UNION ALL
SELECT id, 2, '17:00'::time, 'Ahmedabad - Dhanera' FROM duty_schedules WHERE schedule_number = '83';

-- Schedule 84
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '10:00'::time, 'Dhanera - Ahmedabad' FROM duty_schedules WHERE schedule_number = '84'
UNION ALL
SELECT id, 2, '18:00'::time, 'Ahmedabad - Dhanera' FROM duty_schedules WHERE schedule_number = '84';

-- Schedule 77
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '06:30'::time, 'Ahmedabad - Dahod' FROM duty_schedules WHERE schedule_number = '77'
UNION ALL
SELECT id, 2, '12:30'::time, 'Dahod - Ahmedabad' FROM duty_schedules WHERE schedule_number = '77'
UNION ALL
SELECT id, 3, '18:15'::time, 'Ahmedabad - Dahod' FROM duty_schedules WHERE schedule_number = '77';

-- Schedule 78
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '08:00'::time, 'Dahod - Ahmedabad' FROM duty_schedules WHERE schedule_number = '78';

-- Schedule 114
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '10:30'::time, 'Ahmedabad - Dahod' FROM duty_schedules WHERE schedule_number = '114'
UNION ALL
SELECT id, 2, '16:00'::time, 'Dahod - Ahmedabad' FROM duty_schedules WHERE schedule_number = '114';

-- Schedule 113
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '14:00'::time, 'Ahmedabad - Dahod' FROM duty_schedules WHERE schedule_number = '113'
UNION ALL
SELECT id, 2, '19:30'::time, 'Dahod - Ahmedabad' FROM duty_schedules WHERE schedule_number = '113';

-- Schedule 76
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '06:00'::time, 'Dahod - Ahmedabad' FROM duty_schedules WHERE schedule_number = '76'
UNION ALL
SELECT id, 2, '12:30'::time, 'Ahmedabad - Dahod' FROM duty_schedules WHERE schedule_number = '76'
UNION ALL
SELECT id, 3, '18:00'::time, 'Dahod - Ahmedabad' FROM duty_schedules WHERE schedule_number = '76';

-- Schedule 110
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '08:00'::time, 'Dahod - Ahmedabad' FROM duty_schedules WHERE schedule_number = '110'
UNION ALL
SELECT id, 2, '16:00'::time, 'Ahmedabad - Dahod' FROM duty_schedules WHERE schedule_number = '110';

-- Schedule 100
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '09:00'::time, 'Dahod - Ahmedabad' FROM duty_schedules WHERE schedule_number = '100'
UNION ALL
SELECT id, 2, '17:00'::time, 'Ahmedabad - Dahod' FROM duty_schedules WHERE schedule_number = '100';

-- Schedule 86/87-DAILY-ONE-WAY
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '08:00'::time, 'Ahmedabad - Surendranagar' FROM duty_schedules WHERE schedule_number = '86/87-DAILY-ONE-WAY'
UNION ALL
SELECT id, 2, '12:00'::time, 'Surendranagar - Ahmedabad' FROM duty_schedules WHERE schedule_number = '86/87-DAILY-ONE-WAY'
UNION ALL
SELECT id, 3, '16:00'::time, 'Ahmedabad - Surendranagar' FROM duty_schedules WHERE schedule_number = '86/87-DAILY-ONE-WAY';

-- Schedule 86/87-DAILY-VICE-VERSA
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '08:00'::time, 'Surendranagar - Ahmedabad' FROM duty_schedules WHERE schedule_number = '86/87-DAILY-VICE-VERSA'
UNION ALL
SELECT id, 2, '12:00'::time, 'Ahmedabad - Surendranagar' FROM duty_schedules WHERE schedule_number = '86/87-DAILY-VICE-VERSA'
UNION ALL
SELECT id, 3, '16:00'::time, 'Surendranagar - Ahmedabad' FROM duty_schedules WHERE schedule_number = '86/87-DAILY-VICE-VERSA';

-- Schedule 106
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '05:30'::time, 'Ahmedabad - Statue of Unity' FROM duty_schedules WHERE schedule_number = '106'
UNION ALL
SELECT id, 2, '16:30'::time, 'Statue of Unity - Ahmedabad' FROM duty_schedules WHERE schedule_number = '106';

-- Schedule 91
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '05:45'::time, 'Vadodara - Ambaji' FROM duty_schedules WHERE schedule_number = '91'
UNION ALL
SELECT id, 2, '13:15'::time, 'Ambaji - Vadodara' FROM duty_schedules WHERE schedule_number = '91';

-- Schedule 101
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '06:30'::time, 'Ahmedabad - Patan' FROM duty_schedules WHERE schedule_number = '101'
UNION ALL
SELECT id, 2, '10:30'::time, 'Patan - Ahmedabad' FROM duty_schedules WHERE schedule_number = '101'
UNION ALL
SELECT id, 3, '14:30'::time, 'Ahmedabad - Patan' FROM duty_schedules WHERE schedule_number = '101'
UNION ALL
SELECT id, 4, '18:30'::time, 'Patan - Ahmedabad' FROM duty_schedules WHERE schedule_number = '101';

-- Schedule 122
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '06:00'::time, 'Junagadh - Ahmedabad' FROM duty_schedules WHERE schedule_number = '122'
UNION ALL
SELECT id, 2, '14:30'::time, 'Ahmedabad - Junagadh' FROM duty_schedules WHERE schedule_number = '122';

-- Schedule 73
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '06:30'::time, 'Ahmedabad - Palitana' FROM duty_schedules WHERE schedule_number = '73'
UNION ALL
SELECT id, 2, '13:45'::time, 'Palitana - Ahmedabad' FROM duty_schedules WHERE schedule_number = '73';

-- Schedule 112
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '11:30'::time, 'Palitana - Ahmedabad' FROM duty_schedules WHERE schedule_number = '112'
UNION ALL
SELECT id, 2, '17:00'::time, 'Ahmedabad - Palitana' FROM duty_schedules WHERE schedule_number = '112';

-- Schedule 123
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '06:30'::time, 'Ahmedabad - Modasa' FROM duty_schedules WHERE schedule_number = '123'
UNION ALL
SELECT id, 2, '09:30'::time, 'Modasa - Ahmedabad' FROM duty_schedules WHERE schedule_number = '123'
UNION ALL
SELECT id, 3, '16:00'::time, 'Ahmedabad - Modasa' FROM duty_schedules WHERE schedule_number = '123'
UNION ALL
SELECT id, 4, '20:15'::time, 'Modasa - Ahmedabad' FROM duty_schedules WHERE schedule_number = '123';

-- Schedule 109
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '06:15'::time, 'Modasa - Ahmedabad' FROM duty_schedules WHERE schedule_number = '109'
UNION ALL
SELECT id, 2, '10:15'::time, 'Ahmedabad - Modasa' FROM duty_schedules WHERE schedule_number = '109'
UNION ALL
SELECT id, 3, '14:00'::time, 'Modasa - Ahmedabad' FROM duty_schedules WHERE schedule_number = '109'
UNION ALL
SELECT id, 4, '18:00'::time, 'Ahmedabad - Modasa' FROM duty_schedules WHERE schedule_number = '109';

-- Schedule 88
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '08:15'::time, 'Palitana - Gandhinagar' FROM duty_schedules WHERE schedule_number = '88'
UNION ALL
SELECT id, 2, '17:30'::time, 'Gandhinagar - Palitana' FROM duty_schedules WHERE schedule_number = '88';

-- Schedule 90
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '06:30'::time, 'Savarkundla - Gandhinagar' FROM duty_schedules WHERE schedule_number = '90'
UNION ALL
SELECT id, 2, '15:30'::time, 'Gandhinagar - Savarkundla' FROM duty_schedules WHERE schedule_number = '90';

-- Schedule 119
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '05:30'::time, 'Gandhinagar - Mahuva' FROM duty_schedules WHERE schedule_number = '119'
UNION ALL
SELECT id, 2, '15:15'::time, 'Mahuva - Gandhinagar' FROM duty_schedules WHERE schedule_number = '119';

-- Schedule 89
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '06:00'::time, 'Mahuva - Gandhinagar' FROM duty_schedules WHERE schedule_number = '89'
UNION ALL
SELECT id, 2, '14:00'::time, 'Gandhinagar - Mahuva' FROM duty_schedules WHERE schedule_number = '89';

-- Schedule 107
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '07:30'::time, 'Gandhinagar - Diu' FROM duty_schedules WHERE schedule_number = '107';

-- Schedule 74
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '17:45'::time, 'Gandhinagar - Diu' FROM duty_schedules WHERE schedule_number = '74';

-- Schedule 108
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '08:00'::time, 'Diu - Gandhinagar' FROM duty_schedules WHERE schedule_number = '108';

-- Schedule 75
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '20:30'::time, 'Diu - Gandhinagar' FROM duty_schedules WHERE schedule_number = '75';

-- Schedule 115
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '10:00'::time, 'Gandhinagar - Saputara' FROM duty_schedules WHERE schedule_number = '115'
UNION ALL
SELECT id, 2, '20:00'::time, 'Saputara - Gandhinagar' FROM duty_schedules WHERE schedule_number = '115';

-- Schedule 116
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '07:30'::time, 'Saputara - Gandhinagar' FROM duty_schedules WHERE schedule_number = '116'
UNION ALL
SELECT id, 2, '17:30'::time, 'Gandhinagar - Saputara' FROM duty_schedules WHERE schedule_number = '116';

-- Schedule 117
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '05:45'::time, 'Gandhinagar - Mundra (Shantivan)' FROM duty_schedules WHERE schedule_number = '117'
UNION ALL
SELECT id, 2, '14:05'::time, 'Mundra (Shantivan) - Gandhinagar' FROM duty_schedules WHERE schedule_number = '117';

-- Schedule 118
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '06:00'::time, 'Mundra (Shantivan) - Gandhinagar' FROM duty_schedules WHERE schedule_number = '118'
UNION ALL
SELECT id, 2, '14:15'::time, 'Gandhinagar - Mundra (Shantivan)' FROM duty_schedules WHERE schedule_number = '118';

-- Schedule 124
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '12:10'::time, 'Gandhinagar - Bhuj' FROM duty_schedules WHERE schedule_number = '124';

-- Schedule 125
INSERT INTO schedule_trips (schedule_id, trip_sequence, start_time, route_name)
SELECT id, 1, '12:10'::time, 'Bhuj - Gandhinagar' FROM duty_schedules WHERE schedule_number = '125';
