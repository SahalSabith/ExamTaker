from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('exam', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='exam',
            name='end_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='exam',
            name='results_published',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='exam',
            name='start_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
